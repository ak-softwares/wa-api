import { TOOLS_LIST } from "@/services/ai/tools/data/toolsList";
import { ToolCredentialType, ToolCredentialTypeMeta, ToolPasswordMasking } from "@/types/Tool";

interface Params {
  toolId: string;
  values: Record<string, string>;
}

export function maskCredentialValues({  toolId, values }: Params): Record<string, string | null> {
  const catalogTool = TOOLS_LIST.find((t) => t.id === toolId);
  if (!catalogTool) {
    const out: Record<string, string | null> = {};
    for (const key in values) out[key] = values[key] ? ToolPasswordMasking.MASKED : null;
    return out;
  }

  const fields = catalogTool.credentials ?? [];
  const out: Record<string, string | null> = {};

  for (const field of fields) {
    const type = field.type ?? ToolCredentialType.PASSWORD;
    const val = values?.[field.key];
    const hasValue = !!val;

    const isSafe = ToolCredentialTypeMeta[type]?.safe ?? true;

    // safe => return real value
    if (isSafe) {
      out[field.key] = val ?? "";
      continue;
    }

    // not safe => mask if exists
    out[field.key] = hasValue ? ToolPasswordMasking.MASKED : null;
  }

  return out;
}
