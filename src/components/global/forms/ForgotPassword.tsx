"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { forgotPasswordSchema } from "@/schemas/forgotPassword";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiResponse } from "@/types/apiResponse";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import FooterTerms from "@/components/global/footer/footerTerms";

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { data: session, status } = useSession();
  // Countdown state for resend OTP
  const [counter, setCounter] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isResended, setIsResended] = useState(false);

  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [counter]);
  
  // Call this inside your reset password onSubmit (after success)
  const startCountdown = () => {
    setCounter(60); // start 60s timer after button press
  };

  // ✅ React Hook Form with Zod
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  // ✅ Submit handler for forgot password
  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    try {
        setIsResended(true);
        const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
        });

        const result: ApiResponse = await res.json();

        if (!res.ok) {
          toast.error("Failed to send reset link", { description: result.message });
          return;
        }

        toast.success("Reset link sent", {
        description: "Please check your email for the reset link.",
        });
        startCountdown();
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        const errorMessage =
        axiosError.response?.data?.message || "Something went wrong";
        toast.error("Failed to send reset link", { description: errorMessage });
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-4 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className={cn("flex flex-col gap-6")}>
          <Card className="dark:bg-card">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Forgot Password?</CardTitle>
              <CardDescription>
                Enter your email address and we’ll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">

                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || counter > 0}
                >
                  {isSubmitting
                    ? "Sending Reset Link..."
                    : counter > 0
                    ? `Resend mail in ${counter}s`
                    : "Send Reset Link"}
                </Button>

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="underline underline-offset-4">
                    Sign In
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
          <FooterTerms />
        </div>
      </div>
    </div>
  );
}
