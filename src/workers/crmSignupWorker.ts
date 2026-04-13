import dotenv from "dotenv";
dotenv.config();

import { Job, Worker } from "bullmq";
import { CRM_SIGNUP_QUEUE_NAME } from "@/lib/queues/crmSignupQueue";
import { redis } from "@/lib/redis/redis";
import { sendSignupToCrm } from "@/services/crm/sendSignupToCrm";
import { SignupCrmJobData } from "@/types/Crm";
const isDev = process.env.NODE_ENV !== "production";

const worker = new Worker<SignupCrmJobData>(
  CRM_SIGNUP_QUEUE_NAME,
  async (job: Job<SignupCrmJobData>) => {
    await sendSignupToCrm(job.data);
  },
  {
    connection: redis,
    concurrency: 5,
  },
);

worker.on("completed", (job) => {
  if (isDev) {
    console.log(`[crm-signup-worker] completed job ${job.id}`);
  }
});

worker.on("failed", (job, err) => {
  console.error(
    `[crm-signup-worker] failed job ${job?.id}: ${err.message}`
  );
});

console.log("[crm-signup-worker] started");

async function shutdown() {
  console.log("[crm-signup-worker] shutting down...");
  await worker.close();
  await redis.quit();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);