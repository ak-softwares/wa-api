"use client";

import { useState, useEffect } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "@/components/ui/sonner";

export function useRegisterPhoneNumber() {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumberIsRegistered, setPhoneNumberIsRegistered] = useState<boolean | null>(null);

  // 🔍 Check if WA number is already registered
  const checkRegistration = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/whatsapp/register-phone-number"); // ✅ make new endpoint for status
      const data: ApiResponse & { isRegistered?: boolean } = await res.json();

      if (res.ok && data.success) {
        setPhoneNumberIsRegistered(data.isRegistered ?? false);
      } else {
        setPhoneNumberIsRegistered(false);
      }
    } catch (error) {
      setPhoneNumberIsRegistered(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ⚡ Register WA number
  const registerPhoneNumber = async (onSuccess?: () => void) => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/whatsapp/register-phone-number", {
        method: "POST",
      });

      const data: ApiResponse = await res.json();

      if (data.success) {
        toast.success(data.message);
        setPhoneNumberIsRegistered(true);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong while registering number");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkRegistration();
  }, []);

  return {
    isLoading,
    phoneNumberIsRegistered,
    registerPhoneNumber,
    refreshStatus: checkRegistration,
  };
}
