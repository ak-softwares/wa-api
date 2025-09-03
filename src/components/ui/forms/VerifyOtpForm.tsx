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


const VerifyOtpSchema = z.object({
  otp: z.string().min(4, "OTP must be at least 4 digits"),
});

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone"); // phone passed from login screen

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
