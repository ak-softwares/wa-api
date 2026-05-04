export type User = {
  _id: string;
  name?: string;
  email?: string;
  phone: number;
  company?: string;
  password?: string;
  isVerified?: boolean;
  defaultWaAccountId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}