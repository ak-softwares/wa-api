export enum WalletTransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
  REFUND = "REFUND",
  ADJUSTMENT = "ADJUSTMENT",
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SUCCESS = "success",
  FAILED = "failed",
}

export type WalletTransaction = {
  _id?: string;
  userId: string;
  type: WalletTransactionType;
  currency: string;
  amount: number;
  credits: number;
  creditsBefore: number;
  creditsAfter: number;
  orderId?: string;
  paymentId?: string;
  paymentStatus: PaymentStatus;
  createdAt?: string;
}