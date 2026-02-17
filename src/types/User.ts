export type User = {
  _id: string;
  name: string;
  email: string;
  phone: number;
  company?: string;
  password: string;
  defaultWaAccountId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}