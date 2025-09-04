"use client";

import { Suspense } from "react";
import SignUpForm from "@/components/ui/forms/SignUpForm";
import Header from "@/components/ui/header/header";
import Footer from "@/components/ui/footer/footer";

export default function SignUpPageWrapper() {

  return (
    // <Suspense fallback={<div>Loading...</div>}>
    <div>
      <Header />
      <SignUpForm />
      <Footer />
    </div>
    // </Suspense>
  );
}
