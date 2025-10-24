"use client";

import Sidebar from "@/components/dashboard/sidebar/Sidebar";
import Topbar from "@/components/dashboard/topbar/Topbar";
import { usePusherGlobalNotifications } from "@/hooks/notification/usePusherMessages";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize global Pusher notifications
  usePusherGlobalNotifications();
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        {/* <Topbar /> */}

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
