"use client";

import { useState, useEffect } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { Contact } from "@/types/Contact"; // 👈 your contact type
import { showToast } from "@/components/ui/sonner";

export function useContact(contactId?: string) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contactId) return;

    const fetchContact = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/wa-accounts/contacts/${contactId}`);
        const data: ApiResponse = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || "Failed to fetch contact");
          showToast.error(data.message || "Failed to fetch contact");
          return;
        }

        setContact(data.data || null);
      } catch (err: any) {
        setError("Something went wrong while fetching contact");
        showToast.error("Something went wrong while fetching contact");
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [contactId]);

  return { contact, loading, error, };
}
