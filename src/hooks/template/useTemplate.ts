"use client";

import { useEffect, useState, useCallback } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "@/components/ui/sonner";
import { Template } from "@/types/Template";

export function useTemplates({isSend}: {isSend?: boolean} = {}) {
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  // -------------------------------
  // FETCH ALL TEMPLATES ONCE
  // -------------------------------
  const fetchTemplates = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/whatsapp/template`);
      const json: ApiResponse = await res.json();

      if (json.success && json.data) {
        // 🔥 FILTER ONLY APPROVED WHEN isSend = true
        const visibleTemplates = isSend
          ? json.data.filter(
              (t: Template) => t.status === "APPROVED" // 👈 adjust if needed
            )
          : json.data;
          
        setAllTemplates(json.data);
        setTemplates(visibleTemplates);
      } else {
        setAllTemplates([]);
        setTemplates([]);
      }
    } catch {
      toast.error("Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, [isSend]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // -------------------------------
  // LOCAL SEARCH
  // -------------------------------
  const searchTemplates = (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      setTemplates(allTemplates);
      return;
    }

    const q = value.toLowerCase();

    const filtered = allTemplates.filter((t) =>
      t.name?.toLowerCase().includes(q)
    );

    setTemplates(filtered);
  };

  // -------------------------------
  // REFRESH TEMPLATES
  // -------------------------------
  const refreshTemplates = () => {
    setQuery("");
    fetchTemplates();
  };

  return {
    templates,
    loading,
    searchTemplates,
    refreshTemplates,
  };
}
