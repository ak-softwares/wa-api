export type ApiToken = {
  _id?: string;
  userId: string;
  waAccountId?: string;
  
  name?: string,            // "Production server", "Client A"
  
  token?: string;
  tokenHashed?: string;
  permissions?: [string],   // read, send, webhook, etc

  isRevoked?: boolean,

  lastUsedAt?: string,
  expiresAt?: string,
  createdAt?: string;
  updatedAt?: string;
}
