"use client";

import { Suspense } from "react";
import LoginForm from "@/components/ui/forms/LoginForm";
import Header from "@/components/ui/header/header";
import Footer from "@/components/ui/footer/footer";

export default function LoginPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Header />  
      <LoginForm />
      <Footer />
    </Suspense>
  );
}
