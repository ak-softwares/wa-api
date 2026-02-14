import { ITool, ToolModel } from "@/models/Tool";
import { maskCredentialValues } from "@/lib/tools/maskCredentialValues";
import { Types } from "mongoose";

interface Params {
  userId: Types.ObjectId;
}

export async function getIntegratedToolsRaw({ userId }: Params): Promise<ITool[]> {
  const toolIntegrations = ToolModel.find({ userId }).sort({ createdAt: -1 })
  return toolIntegrations;
}

export async function getIntegratedToolsSafe({ userId }: Params): Promise<ITool[]> {
  const toolIntegrations = await ToolModel.find({ userId }).sort({ createdAt: -1 });

  const safeTools: ITool[] = toolIntegrations.map((tool) => ({
    ...tool.toObject({ getters: true, versionKey: false }), // ✅ converts clean JSON
    credentials: maskCredentialValues(tool.id, tool.credentials || {}),
  }));

  return safeTools;
}
