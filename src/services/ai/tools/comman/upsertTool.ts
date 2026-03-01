import { ToolModel } from "@/models/Tool";
import { maskCredentialValues } from "@/lib/tools/maskCredentialValues";
import { ToolPayload, ToolStatus } from "@/types/Tool";

interface Params {
  userId: string;
  waAccountId?: string;
  tool: ToolPayload;
}

export async function upsertTool({
  userId,
  waAccountId,
  tool,
}: Params) {
  const payload = {
    userId,
    waAccountId,

    id: tool.id,
    name: tool.name || tool.id,
    category: tool.category,

    status: tool.status || ToolStatus.NOT_CONNECTED,
    active: typeof tool.active === "boolean" ? tool.active : true,

    credentials: tool.credentials || {},
  };

  // ✅ Upsert (update if exists, create if not)
  const savedTool = await ToolModel.findOneAndUpdate(
    { userId, id: tool.id },
    { $set: payload },
    {
      new: true,      // return updated doc
      upsert: true,   // create if not exists
      setDefaultsOnInsert: true,
    }
  );

  const plain = savedTool.toObject({ getters: true });

  const safeTool = {
    ...plain,
    credentials: maskCredentialValues({ toolId: savedTool.id, values: plain.credentials || {} }),
  };

  return safeTool;
}
