"use client";

import { Suspense } from "react";
import SignUpForm from "@/components/global/forms/SignUpForm";

export default function SignUpPageWrapper() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
