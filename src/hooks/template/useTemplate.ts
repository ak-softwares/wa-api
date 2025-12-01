"use client";

import { useEffect, useState, useCallback } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "@/components/ui/sonner";
import { Template } from "@/types/Template";

export function useTemplates() {
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
        setAllTemplates(json.data);
        setTemplates(json.data);
      } else {
        setAllTemplates([]);
        setTemplates([]);
      }
    } catch {
      toast.error("Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, []);

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
