import { MessageStatus } from "./MessageType";

// 🔹 Single row in report (per participant message)
export type BroadcastReportRow = {
  _id: string;
  to: string;
  waMessageId?: string;
  status?: MessageStatus;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  errorMessage?: string;
  createdAt?: string;
};