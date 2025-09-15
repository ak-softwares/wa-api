"use client";

import Sidebar from "@/components/dashboard/sidebar/Sidebar";
import Topbar from "@/components/dashboard/topbar/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <Topbar />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
