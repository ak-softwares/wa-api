"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/header/themeToggle";
import { signOut } from "next-auth/react";

export default function Topbar() {
    const handleSignOut = () => {
        signOut({ callbackUrl: "/auth/login" });

    };
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleSignOut}>Logout</Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
