import { useState } from "react";
import axios, { AxiosError } from "axios";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ApiResponse } from "@/types/apiResponse";
import { showToast } from "@/components/ui/sonner";

interface SignUpParams {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export function useSignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const signUp = async (data: SignUpParams) => {
    try {
      setLoading(true);

      // 🔹 Call signup API
      const res = await axios.post<ApiResponse>("/api/auth/signup", data);

      if (!res.data.success) {
        showToast.error("Sign up failed", {
          description: res.data.message,
        });
        return false;
      }

      // 🔹 Auto login
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        showToast.error("Failed to sign in", {
          description: result.error,
        });
        return false;
      }

      // 🔹 Success
      showToast.success("Account created successfully");

      router.push("/dashboard");

      return true;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      showToast.error("Sign up failed", {
        description:
          axiosError.response?.data?.message || axiosError.message,
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    signUp,
  };
}