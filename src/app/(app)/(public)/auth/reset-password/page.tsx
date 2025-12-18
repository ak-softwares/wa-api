"use client"

import { Suspense } from "react";
import ResetPasswordForm from "@/components/global/forms/ResetPassword"
import { Loader } from "@/components/common/Loader";

export default function ForgotPasswordPage() {

  return (
    <Suspense fallback={<Loader />}>
        <ResetPasswordForm />
    </Suspense>
  )
}
