"use client";

import { Suspense } from "react";
import VerifyOtpForm from "@/components/global/forms/VerifyOtpForm";

export default function VerifyOtp() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}
