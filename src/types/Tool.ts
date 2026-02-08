import { ITool } from "@/models/Tool";
import z from "zod";

export enum ToolPasswordMasking {
  MASKED = "**************************",
  NONE = "",
}

export enum ToolStatus {
  NOT_CONNECTED = "not_connected",
  CONNECTED = "connected",
  DISABLED = "disabled",
  PENDING = "pending",
  FAILED = "failed",
  IN_PROGRESS = "in_progress",
}

export enum ToolCredentialType {
  TEXT = "text",
  URL = "url",
  EMAIL = "email",
  NUMBER = "number",
  PASSWORD = "password",
  TOKEN = "token",
  KEY = "key",
  SECRET = "secret",
}

export const ToolCredentialTypeMeta: Record<ToolCredentialType, { safe: boolean }> = {
  [ToolCredentialType.TEXT]: { safe: true },
  [ToolCredentialType.URL]: { safe: true },
  [ToolCredentialType.EMAIL]: { safe: true },
  [ToolCredentialType.NUMBER]: { safe: true },

  [ToolCredentialType.PASSWORD]: { safe: false },
  [ToolCredentialType.TOKEN]: { safe: false },
  [ToolCredentialType.KEY]: { safe: false },
  [ToolCredentialType.SECRET]: { safe: false },
};

export type ToolCredential = {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type: ToolCredentialType;
  value?: string;
}

export type Tool = {
  _id?: string; // MongoDB ObjectId as string
  userId: string;
  waAccountId: string;

  id: string; // tool unique id (shopify, woocommerce, webhook)
  name: string;
  category?: string;

  status: ToolStatus;
  active: boolean;
  credentials: Record<string, string>;

  createdAt?: string;
  updatedAt?: string;
};


export type ToolCatalog = {
  _id?: string; // MongoDB ObjectId as string
  id: string;
  name: string;
  category?: string;
  desc?: string;
  logo?: string;

  status: ToolStatus;
  active: boolean;
  credentials: ToolCredential[];

  createdAt?: string;
  updatedAt?: string;
};

export type ToolPayload = {
  _id?: string; // MongoDB ObjectId as string
  id: string;
  name?: string;
  category?: string;
  active?: boolean;
  status?: ToolStatus;
  credentials?: Record<string, string>;
};


export type ToolExecutor = (args: any, tool: ITool) => Promise<any>;

export type ActionConfig = {
  title?: string;
  description?: string;
  schema: z.ZodTypeAny;
  execute: ToolExecutor;
};