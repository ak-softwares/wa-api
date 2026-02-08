export type AIChat = {
  prompt?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AIProvider = {
  id: string;
  name?: string;
  inputPrice?: number;   // price per 1K tokens
  outputPrice?: number;  // price per 1K tokens
};
