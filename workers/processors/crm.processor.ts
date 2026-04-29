import { Job, Worker } from "bullmq";
import { CRM_SIGNUP_QUEUE_NAME } from "../../src/utiles/constans/queueNames";
import { sendSignupToCrm } from "../../src/core/crm/sendSignupToCrm";
import { SignupCrmJobData } from "../../src/types/Crm";

const isDev = process.env.NODE_ENV !== "production";

export const worker = new Worker<SignupCrmJobData>(
  CRM_SIGNUP_QUEUE_NAME,
  async (job: Job<SignupCrmJobData>) => {
    await sendSignupToCrm(job.data);
  },
  {
    connection: { url: process.env.REDIS_URL! },
    concurrency: 5,
  },
);

worker.on("failed", (job, err) => {
  console.error(`[crm-signup-worker] failed job ${job?.id}: ${err.message}`);
});
