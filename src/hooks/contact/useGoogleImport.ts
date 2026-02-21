"use client";

import { useState, useEffect } from "react";
import { showToast } from "@/components/ui/sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GoogleService } from "@/types/OAuth";

export function useGoogleImport() {
  const [loading, setLoading] = useState(false);
  const service = GoogleService.CONTACTS_IMPORT
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const imported = searchParams.get("imported");
    const count = searchParams.get("count");

    if (imported === "true") {
      showToast.success(`${count} contacts imported successfully!`);

      // ✅ remove query params without reload
      router.replace(pathname);
    }
  }, [searchParams, router, pathname]);

  // ✅ Handle Google Contacts import
  const handleGoogleImport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/oauth/google?tool=${service}`);
      const data = await res.json();

      if (!data.success) {
        showToast.error(data.message || "Failed to get Google OAuth URL");
        setLoading(false);
        return;
      }

      // Redirect user to Google OAuth consent screen
      window.location.href = data.data;
    } catch (err) {
      showToast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { handleGoogleImport, loading };
}
