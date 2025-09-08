"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/global/header/themeToggle";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function Topbar() {
    const handleSignOut = () => {
        signOut({ callbackUrl: "/auth/login" });

    };
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm p-4 flex justify-between items-center">
      <Link href="/dashboard">
        <h2 className="text-xl font-semibold">Dashboard</h2>
      </Link>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleSignOut}>Logout</Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
