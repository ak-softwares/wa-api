"use client";

import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { useSearchParams } from "next/navigation";

export function useGoogleImport() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  // ✅ Show toast if redirected back after successful import
  useEffect(() => {
    const imported = searchParams.get("imported");
    const count = searchParams.get("count");
    if (imported === "true") {
      toast.success(`${count} contacts imported successfully!`);
    }
  }, [searchParams]);

  // ✅ Handle Google Contacts import
  const handleGoogleImport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/google/get-contact-url");
      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Failed to get Google OAuth URL");
        setLoading(false);
        return;
      }

      // Redirect user to Google OAuth consent screen
      window.location.href = data.url;
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { handleGoogleImport, loading };
}
