import { toast } from "@/components/ui/sonner";
import { useState } from "react";

type CodeMethod = "SMS" | "VOICE";

export function usePhoneCodeVerification() {
  const [requestCodeLoading, setRequestCodeLoading] = useState(false);
  const [verifyCodeLoading, setVerifyCodeLoading] = useState(false);

  // ✅ Request Code
  const requestCode = async (code_method: CodeMethod = "SMS") => {
    try {
      setRequestCodeLoading(true);

      const res = await fetch("/api/facebook/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_method }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Failed to request verification code");
        return false;
      }

      toast.success("Verification code sent successfully");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to request verification code");
      return false;
    } finally {
      setRequestCodeLoading(false);
    }
  };

  // ✅ Verify Code
  const verifyCode = async (code: string) => {
    try {
      setVerifyCodeLoading(true);

      if (!code) {
        toast.error("Verification code is required");
        return false;
      }

      const res = await fetch("/api/facebook/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Verification failed");
        return false;
      }

      toast.success("Phone number verified successfully");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
      return false;
    } finally {
      setVerifyCodeLoading(false);
    }
  };

  return {
    requestCode,
    verifyCode,
    requestCodeLoading,
    verifyCodeLoading,
  };
}
