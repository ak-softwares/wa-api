"use client"

import { Suspense } from "react";
import ResetPasswordForm from "@/components/global/forms/ResetPassword"

export default function ForgotPasswordPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
    </Suspense>
  )
}
