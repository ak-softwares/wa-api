export interface IAIAgent {
  prompt?: string;
  webhookUrl?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}