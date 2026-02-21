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
import { Input, ShadcnPhoneInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/schemas/signUpSchema";
import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import FooterTerms from "@/components/global/footer/footerTerms";
import { DASHBOARD_PATH, LOGIN_PATH } from "@/utiles/auth/auth";
import { useSignUp } from "@/hooks/auth/useSignUp";

export default function SignUpForm() {
  const router = useRouter();
  
  const { status } = useSession();
  const { signUp, loading } = useSignUp();

  // ✅ redirect safely after render
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(DASHBOARD_PATH);
    }
  }, [status, router]);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    await signUp(data);
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className={cn("flex flex-col gap-6")}>
          <Card className="dark:bg-card">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Create your account</CardTitle>
              <CardDescription>
                Sign up with your details below
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" type="text" placeholder="John Doe" {...register("name")} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div className="grid gap-2">
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

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" {...register("password")} />
                  {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing up..." : "Sign Up"}
                </Button>

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href={LOGIN_PATH} className="underline underline-offset-4">
                    Sing In
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
