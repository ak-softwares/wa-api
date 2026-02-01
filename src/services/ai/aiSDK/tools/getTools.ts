import { ITool, ToolModel } from "@/models/Tool";
import { maskCredentialValues } from "@/lib/tools/maskCredentialValues";
import { Types } from "mongoose";

interface Params {
  userId: Types.ObjectId;
  waAccountId: Types.ObjectId;
}

async function fetchTools({ userId, waAccountId }: Params): Promise<ITool[]> {
  return ToolModel.find({
    userId,
    waAccountId,
  }).sort({ createdAt: -1 })
}

export async function getIntegratedToolsRaw({ userId, waAccountId }: Params): Promise<ITool[]> {
  const toolIntegrations: ITool[] = await fetchTools({ userId, waAccountId });
  return toolIntegrations;
}

export async function getIntegratedToolsSafe({ userId, waAccountId }: Params): Promise<ITool[]> {
  const toolIntegrations = await ToolModel.find({
    userId,
    waAccountId,
  }).sort({ createdAt: -1 });

  const safeTools: ITool[] = toolIntegrations.map((tool) => ({
    ...tool.toObject({ getters: true, versionKey: false }), // ✅ converts clean JSON
    credentials: maskCredentialValues(tool.id, tool.credentials || {}),
  }));

  return safeTools;
}