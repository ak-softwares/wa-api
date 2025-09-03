"use client";

import { Suspense } from "react";
import SignUpForm from "@/components/ui/forms/SignUpForm";
import Header from "@/components/ui/header/header";
import Footer from "@/components/ui/footer/footer";
import VerifyOtpForm from "@/components/ui/forms/VerifyOtpForm";

export default function VerifyOtp() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Header />  
      <VerifyOtpForm />
      <Footer />
    </Suspense>
  );
}
