"use client";

import { useState } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "@/components/ui/sonner";

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
        toast.success(data.message);
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


  return {
    isLoading,
    registerPhoneNumber,
  };
}
