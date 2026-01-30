import { initConfig } from "./config/index.js";
import { initPrisma } from "./utils/prisma.js";
import { processOutboxOnce } from "./workers/outbox.worker.js";


export const handler = async (_event: any = {}): Promise<any> => {
  await initConfig();
  initPrisma();

  console.log("[OutboxLambda] Triggered scheduled outbox processing");

  const processed = await processOutboxOnce();

  console.log(`[OutboxLambda] Completed processing, total processed=${processed}`);

  return { processed };
};
