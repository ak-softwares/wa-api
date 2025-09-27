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
import { toast } from "@/components/ui/sonner";
import { signInSchema } from "@/schemas/signInSchema";
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

export default function SignInForm() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { data: session, status } = useSession();

  // Always call hooks unconditionally
  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);


  // ✅ React Hook Form with Zod
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  // ✅ Submit handler
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (result?.error) {
        toast.error("Failed to sign in", { description: result.error });
      } else {
        toast.success("Signed in successfully");
        router.push("/dashboard");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data?.message || "Something went wrong";
      toast.error("Failed to sign in", { description: errorMessage });
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

  const gotoLogin = () => {
    router.push("/auth/login"); // change path as needed
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-4 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                Login with your email or Google account
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

                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
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
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>

                <div className="relative text-center text-sm after:border-t after:border-border after:inset-0 after:top-1/2 after:absolute after:z-0">
                  <span className="bg-card relative z-10 px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    onClick={() => gotoLogin()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 mr-2"
                      fill="currentColor"
                    >
                      <path d="M17 1H7a2 2 0 0 0-2 2v18a2 
                              2 0 0 0 2 2h10a2 2 0 0 0 
                              2-2V3a2 2 0 0 0-2-2zm0 18H7V5h10v14z"/>
                      <circle cx="12" cy="19" r="1"/>
                    </svg>
                    Continue with Phone
                  </Button>
                </div>

                <div className="flex flex-col gap-4">
                  <Button variant="outline" className="w-full" type="button"  onClick={() => onGoogleSignIn()}>
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
                  <Link
                    href="/auth/signup"
                    className="underline underline-offset-4"
                  >
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
