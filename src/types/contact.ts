export interface IContact {
  _id: string;
  userId: string;
  name: string;
  phone: string[];
  email?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}
