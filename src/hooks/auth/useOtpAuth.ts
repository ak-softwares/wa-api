import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/apiResponse";
import { showToast } from "@/components/ui/sonner";

interface VerifyOtpParams {
  phone: string;
  otp: string;
}

export function usePhoneOtpAuth() {
  const router = useRouter();

  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // 🔹 Send OTP
  const sendOtp = async (phone: string) => {
    try {
      setSendLoading(true);

      await axios.post("/api/auth/send-otp", { phone });

      showToast.success("OTP sent successfully!");
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      const message =
        axiosError.response?.data?.message || "Failed to send OTP";

      showToast.error("Error", {
        description: message,
      });

      return false;
    } finally {
      setSendLoading(false);
    }
  };

  // 🔹 Verify OTP & Login
  const verifyOtp = async ({ phone, otp }: VerifyOtpParams) => {
    try {
      setVerifyLoading(true);

      const result = await signIn("phone-otp", {
        redirect: false,
        phone,
        otp,
      });

      if (result?.error) {
        showToast.error("Failed to login", {
          description: result.error,
        });
        return false;
      }

      showToast.success("Login successfully");
      router.push("/dashboard");
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      const message =
        axiosError.response?.data?.message || "Something went wrong";

      showToast.error("Failed to verify OTP", {
        description: message,
      });

      return false;
    } finally {
      setVerifyLoading(false);
    }
  };

  return {
    sendLoading,
    verifyLoading,
    sendOtp,
    verifyOtp,
  };
}