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
import { resetPasswordSchema } from "@/schemas/resetPassword";
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
import { useSearchParams } from "next/navigation";

export default function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

    // ✅ get email & token from URL
  const email = searchParams.get("email");
  const token = searchParams.get("token");


  // ✅ React Hook Form with Zod
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  // ✅ Submit handler for reset password
  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    if (!email || !token) {
      toast.error("Invalid reset link", {
        description: "Please request a new password reset.",
      });
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          newPassword: data.password,
        }),
      });

      const result: ApiResponse = await res.json();

      if (!res.ok) {
        toast.error("Failed to reset password", { description: result.message });
        return;
      }

      toast.success("Password reset successful", {
        description: "You can now login with your new password.",
      });

      router.push("/auth/signin");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Something went wrong";
      toast.error("Failed to reset password", { description: errorMessage });
    }
  };


  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-4 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className={cn("flex flex-col gap-6")}>
          <Card className="dark:bg-card">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Reset Password</CardTitle>
              <CardDescription>
                Set a new strong password you can remember. <br />
                Email: {email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">

                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">New Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Resetting Password..." : "Reset Password"}
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
