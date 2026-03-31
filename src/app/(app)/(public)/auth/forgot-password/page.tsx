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
import { showToast } from "@/components/ui/sonner";
import { forgotPasswordSchema } from "@/schemas/forgotPassword";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiResponse } from "@/types/apiResponse";
import { useState } from "react";
import Link from "next/link";
import { useEffect } from "react";
import FooterTerms from "@/components/global/footer/footerTerms";

export default function ForgotPasswordPage() {

  const [delivery, setDelivery] = useState<"email" | "whatsapp">("email");

  // Countdown state for resend OTP
  const [counter, setCounter] = useState(0);

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

  const submitFor = (mode: "email" | "whatsapp") => {
    setDelivery(mode);
    return handleSubmit((data) => onSubmit({ ...data }, mode))();
  };

  // ✅ Submit handler for forgot password
  const onSubmit = async (
    data: z.infer<typeof forgotPasswordSchema>,
    mode: "email" | "whatsapp" = delivery
  ) => {
    try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, delivery: mode }),
        });

        const result: ApiResponse = await res.json();

        if (!res.ok) {
          showToast.error("Failed to send reset link", { description: result.message });
          return;
        }

        showToast.success("Reset link sent", {
          description:
            mode === "whatsapp"
              ? "Please check your WhatsApp for the reset link."
              : "Please check your email for the reset link.",
        });
        startCountdown();
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        const errorMessage =
        axiosError.response?.data?.message || "Something went wrong";
        showToast.error("Failed to send reset link", { description: errorMessage });
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
              <form className="grid gap-6">

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

                <div className="grid gap-2">
                  <Button
                    type="button"
                    className="w-full"
                    disabled={isSubmitting || counter > 0}
                    onClick={() => submitFor("email")}
                  >
                    {isSubmitting && delivery === "email"
                      ? "Sending Reset Link..."
                      : counter > 0
                      ? `Resend link in ${counter}s`
                      : "Send Reset Link"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isSubmitting || counter > 0}
                    onClick={() => submitFor("whatsapp")}
                  >
                    {isSubmitting && delivery === "whatsapp"
                      ? "Sending to WhatsApp..."
                      : "Send Reset Link to WhatsApp"}
                  </Button>
                </div>

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
