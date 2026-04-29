import { Queue } from "bullmq";
import { SignupCrmJobData } from "@/types/Crm";
import { CRM_SIGNUP_QUEUE_NAME } from "@/utiles/constans/queueNames";

export const crmSignupQueue = new Queue<SignupCrmJobData>(
  CRM_SIGNUP_QUEUE_NAME,
  {
    connection: {
      url: process.env.REDIS_URL!,
    },
    defaultJobOptions: {
      attempts: 1,
      backoff: { // This means when a job fails, BullMQ will automatically retry it with increasing delays.
        type: "exponential",
        delay: 3_000,
      },
      removeOnComplete: 10, // keep last 10 completed jobs only
      removeOnFail: 10,
    },
  },
);

export async function enqueueSignupToCrmJob(data: SignupCrmJobData) {
  await crmSignupQueue.add("signup-created", data, {
    jobId: data.phone,
  });
}
