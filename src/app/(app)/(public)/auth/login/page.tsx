"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShadcnPhoneInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { toast } from "@/components/ui/sonner";
import { LoginSchema } from "@/schemas/loginSchema";
import { ApiResponse } from "@/types/apiResponse";
import { useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import FooterTerms from "@/components/global/footer/footerTerms";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const { status } = useSession();

  // Always call hooks unconditionally
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      phone: "",
    },
  });

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = form;

  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    try {
      const response = await axios.post<ApiResponse>("/api/auth/send-otp", {
        phone: data.phone, // assuming your form has `phone`
      });

      if (response.data.success) {
        toast.success("OTP sent successfully", {
          description: response.data.message,
        });
        router.push(`/auth/verify-otp?phone=${data.phone}`);
      } else {
        toast.error("Failed to send OTP", {
          description: response.data.message,
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Something went wrong";
      toast.error("Failed to send OTP", { description: errorMessage });
    }
  };

  // ✅ Google SignIn handler
  const onGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signIn("google", {
        redirect: false, // prevent auto redirect
      });
      if (result?.error) {
        toast.error("Google sign-in failed", { description: result.error });
      } else {
        toast.success("Signed in successfully");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Google sign-in failed", {
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const gotoSignIn = () => {
    router.push("/auth/signin"); // change path as needed
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className={cn("flex flex-col gap-6")}>
          <Card className="dark:bg-card">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Login with Phone</CardTitle>
              <CardDescription>
                Enter your mobile number to continue
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">

                <div className="grid gap-3">
                  <Label htmlFor="phone">Phone</Label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <ShadcnPhoneInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Connecting..." : "Login with WhatsApp"}
                </Button>

                <div className="relative text-center text-sm after:border-t after:border-border after:inset-0 after:top-1/2 after:absolute after:z-0">
                  <span className="bg-[#F3F4F6] dark:bg-card relative z-1 px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  <Button variant="outline" className="w-full" type="button"  onClick={() => gotoSignIn()}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 mr-2"
                    fill="currentColor"
                  >
                    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 
                            2 0 0 0 2 2h16a2 2 0 0 0 
                            2-2V6a2 2 0 0 0-2-2zm0 2v.511l-8 
                            5.334-8-5.334V6h16zM4 18V8.489l8 
                            5.333 8-5.333V18H4z"/>
                  </svg>

                    Login with Email and Password
                  </Button>
                  <Button variant="outline" className="w-full" type="button" disabled={loading} onClick={() => onGoogleSignIn()}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-4 w-4 mr-2"
                    >
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    {loading ? "Signing in with Google..." : "Continue with Google"}
                  </Button>
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

          <FooterTerms />
        </div>
      </div>
    </div>
  );
}
