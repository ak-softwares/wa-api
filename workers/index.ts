import dotenv from "dotenv";
dotenv.config();

import { worker as crmWorker } from "./processors/crm.processor";

console.log("[workers] all workers started");

async function shutdown() {
  console.log("[workers] shutting down...");
  await crmWorker.close();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);