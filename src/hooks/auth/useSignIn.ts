import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/sonner";
import { AxiosError } from "axios";
import { ApiResponse } from "@/types/apiResponse";

interface SignInParams {
  email: string;
  password: string;
}

export function useSignIn() {
  const router = useRouter();
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // 🔹 Credentials SignIn
  const signInWithCredentials = async (data: SignInParams) => {
    try {
      setCredentialsLoading(true);

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

      showToast.success("Signed in successfully");
      router.push("/dashboard");
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      const message =
        axiosError.response?.data?.message || "Something went wrong";

      showToast.error("Failed to sign in", {
        description: message,
      });

      return false;
    } finally {
      setCredentialsLoading(false);
    }
  };

  // 🔹 Google SignIn
  const signInWithGoogle = async () => {
    try {
      setGoogleLoading(true);

      const result = await signIn("google", {
        redirect: false,
      });

      if (result?.error) {
        showToast.error("Google sign-in failed", {
          description: result.error,
        });
        return false;
      }

      showToast.success("Signed in successfully");
      router.push("/dashboard");
      return true;
    } catch (error) {
      showToast.error("Google sign-in failed", {
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });

      return false;
    } finally {
      setGoogleLoading(false);
    }
  };

  return {
    credentialsLoading,
    googleLoading,
    signInWithCredentials,
    signInWithGoogle,
  };
}