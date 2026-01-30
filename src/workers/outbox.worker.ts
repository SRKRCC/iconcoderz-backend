import { prisma } from "../utils/prisma.js";
import { QRService } from "../services/qr.service.js";
import { EmailService } from "../services/email.service.js";

const BATCH_SIZE = 5;
const MAX_ATTEMPTS = 5;

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

        // Send email directly (synchronous) and forward payload fields
        try {
          await EmailService.sendConfirmationNow(email, fullName, registrationCode, qrDataUrl, {
            phone: payload.phone,
            registrationNumber: payload.registrationNumber,
            branch: payload.branch,
            yearOfStudy: payload.yearOfStudy,
            codechefHandle: payload.codechefHandle,
            leetcodeHandle: payload.leetcodeHandle,
            codeforcesHandle: payload.codeforcesHandle,
          });
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

/**
 * One-off processing function intended for scheduled Lambdas.
 * Ensures the DB trigger exists and processes outbox rows in batches until none remain.
 * Returns the total number of processed rows.
 */
export async function processOutboxOnce(): Promise<number> {
  console.log("[OutboxWorker] Running one-off processing (processOutboxOnce)");
  await ensureNotifyTrigger();

  let totalProcessed = 0;
  // Process until no more rows are found; cap iterations for safety
  for (let i = 0; i < 1000; i++) {
    const processed = await claimAndProcess();
    totalProcessed += processed;
    if (processed === 0) break;
  }

  console.log(`[OutboxWorker] processOutboxOnce finished, processed=${totalProcessed}`);
  return totalProcessed;
}