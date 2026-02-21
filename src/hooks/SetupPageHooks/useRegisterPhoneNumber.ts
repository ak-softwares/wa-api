"use client";

import { useState } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { showToast } from "@/components/ui/sonner";

export function useRegisterPhoneNumber() {
  const [isLoading, setIsLoading] = useState(false);

  // ⚡ Register WA number
  const registerPhoneNumber = async (onSuccess?: () => void) => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/facebook/register-phone-number", {
        method: "POST",
      });

      const data: ApiResponse = await res.json();

      if (data.success) {
        showToast.success(data.message);
        if (onSuccess) onSuccess();
      } else {
        showToast.error(data.message);
      }
    } catch (error) {
      showToast.error("Something went wrong while registering number");
    } finally {
      setIsLoading(false);
    }
  };


  return {
    isLoading,
    registerPhoneNumber,
  };
}
