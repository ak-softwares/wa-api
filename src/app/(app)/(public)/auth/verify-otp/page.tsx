"use client";

import { Suspense } from "react";
import VerifyOtpForm from "@/components/global/forms/VerifyOtpForm";
import { Loader } from "@/components/common/Loader";

export default function VerifyOtp() {

  return (
    <Suspense fallback={<Loader />}>
      <VerifyOtpForm />
    </Suspense>
  );
}
