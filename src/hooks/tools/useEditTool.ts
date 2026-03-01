import { useState } from "react";
import { showToast } from "@/components/ui/sonner";
import { ApiResponse } from "@/types/apiResponse";
import { Tool, ToolPayload } from "@/types/Tool";

export function useEditTool(
  onSuccess?: (tool: Tool) => void,
  onDeleteSuccess?: (toolId: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // ✅ CREATE
  const createTool = async (payload: ToolPayload) => {
    try {
      setLoading(true);

      const res = await fetch("/api/ai/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json: ApiResponse<Tool> = await res.json();

      if (!res.ok || !json.success) {
        showToast.error(json.message || "Failed to create tool");
        return;
      }
      if (!json.data) {
        showToast.error("Tool created but no data returned");
        return;
      }
      showToast.success("Tool connected successfully");
      onSuccess?.(json.data);
      return json.data;
    } catch (err: any) {
      showToast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATE
  const updateTool = async (toolDbId: string, payload: ToolPayload) => {
    try {
      setLoading(true);

      const res = await fetch(`/api/ai/tools/${toolDbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json: ApiResponse<Tool> = await res.json();

      if (!res.ok || !json.success) {
        showToast.error(json.message || "Failed to update tool");
        return;
      }
      if (!json.data) {
        showToast.error("Tool updated but no data returned");
        return;
      }
      showToast.success("Tool updated successfully");
      onSuccess?.(json.data);
      return json.data;
    } catch (err: any) {
      showToast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE
  const deleteTool = async (toolDbId: string) => {
    try {
      setIsDeleteLoading(true);

      const res = await fetch(`/api/ai/tools/${toolDbId}`, {
        method: "DELETE",
      });

      const json: ApiResponse<{ _id: string }> = await res.json();

      if (!res.ok || !json.success) {
        showToast.error(json.message || "Failed to delete tool");
        return;
      }

      showToast.success("Tool deleted successfully");
      onDeleteSuccess?.(toolDbId);

      return json.data;
    } catch (err: any) {
      showToast.error(err.message || "Something went wrong");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return { createTool, updateTool, deleteTool, loading, isDeleteLoading };
}
