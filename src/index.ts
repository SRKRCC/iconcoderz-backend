import { app } from "./app.js";
import { config, initConfig } from "./config/index.js";
import { initPrisma } from "./utils/prisma.js";

const PORT = config.port;

async function start() {
  await initConfig();
  initPrisma();

  app.listen(PORT, () => {
    console.log(
      `Server running in ${config.env} mode on http://localhost:${PORT}`,
    );
    console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
