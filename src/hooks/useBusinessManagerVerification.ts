"use client";

import { useState, useEffect, useCallback } from "react";

interface VerificationDetails {
  status: string;
  updatedAt?: string;
}

interface VerificationResponse {
  success: boolean;
  message: string;
  data?: {
    status: string;
    details: VerificationDetails;
  };
}

export function useBusinessVerification(autoCheck: boolean = true) {
  const [status, setStatus] = useState<string>("unknown");
  const [details, setDetails] = useState<VerificationDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkVerification = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/facebook/verify-business");
      const data: VerificationResponse = await res.json();

      if (data.success) {
        setStatus(data.data?.status || "unknown");
        setDetails(data.data?.details || null);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to check verification");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoCheck) {
      checkVerification();
    }
  }, [autoCheck, checkVerification]);

  return {
    status,
    details,
    isLoading,
    error,
    refresh: checkVerification,
  };
}
