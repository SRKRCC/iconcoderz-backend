import { prisma } from "../utils/prisma.js";
import { QRService } from "../services/qr.service.js";
import { EmailService } from "../services/email.service.js";
import { config } from "../config/index.js";
import { Client as PgClient, type Notification } from "pg";

// Backoff sequence (ms) — adaptive; we start idle at 5 minutes per request
const BACKOFF_SEQUENCE = [2000, 5000, 15000, 60000, 300000]; // 2s → 5m (last)
const BATCH_SIZE = 5;
const MAX_ATTEMPTS = 5;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function ensureNotifyTrigger() {
  const sql = `DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'outbox_notify') THEN
    CREATE FUNCTION outbox_notify() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      PERFORM pg_notify('outbox_insert', NEW.id::text);
      RETURN NEW;
    END;
    $$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'outbox_notify_trigger') THEN
    CREATE TRIGGER outbox_notify_trigger
    AFTER INSERT ON "Outbox"
    FOR EACH ROW EXECUTE FUNCTION outbox_notify();
  END IF;
END$$;`;

  try {
    await prisma.$executeRawUnsafe(sql);
    console.log("[OutboxWorker] Ensured NOTIFY trigger exists");
  } catch (err) {
    console.error("[OutboxWorker] Failed to ensure NOTIFY trigger:", err);
  }
}

let pgListener: PgClient | null = null;

async function setupListener(onNotify: (payload: string) => void) {
  try {
    pgListener = new PgClient({ connectionString: config.db.url });
    await pgListener.connect();
    pgListener.on('notification', (msg: Notification) => {
      if (msg.channel === 'outbox_insert') {
        try {
          onNotify(msg.payload || '');
        } catch (err) {
          console.error('[OutboxWorker] Error handling notification', err);
        }
      }
    });
    await pgListener.query('LISTEN outbox_insert');
    console.log('[OutboxWorker] Listening for outbox_insert notifications');
  } catch (err) {
    console.error('[OutboxWorker] Failed to setup listener:', err);
    try {
      if (pgListener) await pgListener.end();
    } catch {}
    pgListener = null;
  }
}

async function claimAndProcess(): Promise<number> {
  // Atomically claim a batch using UPDATE ... RETURNING with FOR UPDATE SKIP LOCKED selection
  const raw = `WITH cte AS (
      SELECT id FROM "Outbox"
      WHERE status = 'PENDING' AND (nextRetryAt IS NULL OR nextRetryAt <= NOW())
      ORDER BY "createdAt" ASC
      LIMIT ${BATCH_SIZE}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE "Outbox"
    SET status = 'PROCESSING', attempts = attempts + 1
    WHERE id IN (SELECT id FROM cte)
    RETURNING *;`;

  let rows: any[] = [];
  try {
    rows = (await prisma.$queryRawUnsafe(raw)) as any[];
  } catch (err) {
    console.error('[OutboxWorker] Failed to claim rows:', err);
    return 0;
  }

  if (!rows || rows.length === 0) return 0;

  for (const c of rows) {
    try {
      console.log(`[OutboxWorker] Processing outbox ${c.id} type=${c.type}`);

      if (c.type === 'send_confirmation') {
        const payload = c.payload as any;
        const registrationCode = payload.registrationCode;
        const userId = payload.userId;
        const email = payload.email;
        const fullName = payload.fullName;

        // Generate QR
        let qrDataUrl: string;
        try {
          qrDataUrl = await QRService.generate(registrationCode, userId);
        } catch (err) {
          throw new Error(`QR generation failed: ${(err as Error).message || err}`);
        }

        // Send email directly (synchronous)
        try {
          await EmailService.sendConfirmationNow(email, fullName, registrationCode, qrDataUrl, {});
        } catch (err) {
          throw new Error(`Email send failed: ${(err as Error).message || err}`);
        }
      } else {
        console.warn(`[OutboxWorker] Unknown outbox type: ${c.type}`);
      }

      // Success - mark done
      await prisma.outbox.update({ where: { id: c.id }, data: { status: 'DONE', processedAt: new Date(), lastError: null } });
      console.log(`[OutboxWorker] Outbox ${c.id} processed successfully.`);
    } catch (err) {
      console.error(`[OutboxWorker] Failed processing outbox ${c.id}:`, err);
      const attempts = (c.attempts || 0);
      if (attempts >= MAX_ATTEMPTS) {
        await prisma.outbox.update({
          where: { id: c.id },
          data: { status: 'FAILED', lastError: (err as Error).message || String(err), processedAt: new Date() },
        });
        console.error(`[OutboxWorker] Outbox ${c.id} moved to FAILED after ${attempts} attempts.`);
      } else {
        const delaySeconds = Math.min(60 * Math.pow(2, attempts - 1), 60 * 60); // cap at 1 hour
        const nextRetryAt = new Date(Date.now() + delaySeconds * 1000);
        await prisma.outbox.update({
          where: { id: c.id },
          data: { status: 'PENDING', nextRetryAt, lastError: (err as Error).message || String(err) },
        });
        console.log(`[OutboxWorker] Outbox ${c.id} scheduled retry at ${nextRetryAt.toISOString()}`);
      }
    }
  }

  return rows.length;
}

async function main() {
  console.log("[OutboxWorker] Starting worker");

  // Ensure DB trigger exists to emit NOTIFY on insert
  await ensureNotifyTrigger();

  // Setup LISTEN/NOTIFY
  let notifyPending = false;
  await setupListener((_payload) => {
    // when notified, we set a flag to trigger immediate processing
    notifyPending = true;
  });

  // adaptive backoff index; start at the last (5m) to reduce DB polling when idle
  let backoffIndex = BACKOFF_SEQUENCE.length - 1;

  while (true) {
    try {
      // If a notification was received, process immediately and reset backoff
      if (notifyPending) {
        notifyPending = false;
        const processed = await claimAndProcess();
        if (processed > 0) backoffIndex = 0;
        continue; // immediately loop again
      }

      const processed = await claimAndProcess();
      if (processed > 0) {
        backoffIndex = 0;
        continue; // more work likely; process immediately
      }

      // No work found; increase backoff up to max index
      backoffIndex = Math.min(backoffIndex + 1, BACKOFF_SEQUENCE.length - 1);
      const sleepMs = BACKOFF_SEQUENCE[backoffIndex];
      console.log(`[OutboxWorker] No work found, sleeping ${sleepMs}ms (backoff index ${backoffIndex})`);
      await sleep(sleepMs);
    } catch (err) {
      console.error("[OutboxWorker] Error in processing loop:", err);
      // On error, wait a short time before retrying to avoid busy loop
      await sleep(5000);
    }
  }
}

main().catch((err) => {
  console.error("[OutboxWorker] Fatal error", err);
  process.exit(1);
});
