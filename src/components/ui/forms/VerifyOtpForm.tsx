"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { ApiResponse } from "@/types/apiResponse";
import { signIn } from "next-auth/react";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { VerifyOtpSchema } from "@/schemas/verifyOtpSchema";
import { useEffect, useState } from "react";

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone"); // phone passed from login screen

  // Countdown state for resend OTP
  const [counter, setCounter] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [counter]);

  const form = useForm<z.infer<typeof VerifyOtpSchema>>({
    resolver: zodResolver(VerifyOtpSchema),
    defaultValues: { otp: "" },
  });

  const { handleSubmit, control, formState: { errors, isSubmitting } } = form;

  const onSubmit = async (data: z.infer<typeof VerifyOtpSchema>) => {
    try {
        const result = await signIn("phone-otp", {
            redirect: false,
            phone,
            otp: data.otp,
        });

      if (result?.error) {
        toast.error("Failed to login", { description: result.error });
      } else {
        toast.success("Login in successfully");
        router.push("/dashboard");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Something went wrong";
      toast.error("Failed to verify OTP", { description: errorMessage });
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsResending(true);
      await axios.post("/api/auth/send-otp", { phone }); // 👈 replace with your OTP API
      toast.success("OTP resent successfully!");
      setCounter(60); // restart countdown
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Verify OTP</CardTitle>
                <CardDescription>
                Enter the 4-digit code we sent to{" "}
                <button
                    type="button"
                    onClick={() => router.push("/auth/login?phone=" + encodeURIComponent(phone ?? ''))} // 👈 back to phone input screen
                    className="font-medium inline-flex items-center gap-1 underline underline-offset-2"
                >
                    {phone}
                    <Pencil className="h-4 w-4 ml-1" />
                </button>
                </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="otp">OTP</Label>
                <Controller
                  name="otp"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="Enter OTP"
                      maxLength={4}
                      {...field}
                    />
                  )}
                />
                {errors.otp && (
                  <p className="text-sm text-red-500">{errors.otp.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify OTP"}
              </Button>

              {/* Resend OTP Feature */}
              <div className="text-center text-sm">
                {counter > 0 ? (
                  <p className="text-gray-500">
                    Resend OTP in {counter}s
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="link"
                    disabled={isResending}
                    onClick={handleResendOtp}
                  >
                    {isResending ? "Resending..." : "Resend OTP"}
                  </Button>
                )}
              </div>
              <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/signup" className="underline underline-offset-4">
                  Sign up
                  </Link>
              </div>
            </form>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
