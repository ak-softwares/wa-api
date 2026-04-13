import { Queue } from "bullmq";
import { redis } from "@/lib/redis/redis";
import { SignupCrmJobData } from "@/types/Crm";

export const CRM_SIGNUP_QUEUE_NAME = "crm-signup-queue";

export const crmSignupQueue = new Queue<SignupCrmJobData>(
  CRM_SIGNUP_QUEUE_NAME,
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 1,
      backoff: {
        type: "exponential",
        delay: 3_000,
      },
      removeOnComplete: 1000,
      removeOnFail: 1000,
    },
  },
);

export async function enqueueSignupToCrmJob(data: SignupCrmJobData) {
  await crmSignupQueue.add("signup-created", data, {
    jobId: data.email,
  });
}
