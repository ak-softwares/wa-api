"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/global/header/themeToggle";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RefreshButton } from "@/components/global/header/Refresh";
import { showToast } from "@/components/ui/sonner";
export default function Topbar() {
  const pathname = usePathname();

  // Map each route with title + tagline
  const routeInfo: Record<
    string,
    { title: string; tagline: string }
  > = {
    "/dashboard": {
      title: "Dashboard",
      tagline: "Overview of your WhatsApp API integration",
    },
    "/dashboard/messages": {
      title: "Messages",
      tagline: "Manage and track all your conversations",
    },
    "/dashboard/contacts": {
      title: "Contacts",
      tagline: "Organize and engage with your audience",
    },
    "/dashboard/settings": {
      title: "Settings",
      tagline: "Configure your WhatsApp API preferences",
    },
  };

  const { title, tagline } =
    routeInfo[pathname] || {
      title: "Dashboard",
      tagline: "Manage your WhatsApp API integration",
    };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm p-4 flex justify-between items-center">
      <Link href="/dashboard">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tagline}</p>
        </div>
      </Link>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleSignOut}>
          Logout
        </Button>
        <RefreshButton />
        <ThemeToggle />
      </div>
    </header>
  );
}
