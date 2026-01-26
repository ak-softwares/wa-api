import { useEffect, useState } from "react";
import { Tool } from "@/types/Tool";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "@/components/ui/sonner";

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTools = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/tools", {
        method: "GET",
      });

      const json: ApiResponse<Tool[]> = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.message || "Failed to fetch tools");
      }

      setTools(json.data || []);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  return { tools, setTools,loading };
}
