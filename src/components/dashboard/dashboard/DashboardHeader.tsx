"use client";

import { ConfirmDialog } from "@/components/common/dialog/ConfirmDialog";
import { ThemeToggle } from "@/components/global/header/themeToggle";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/profile/useLogout";
import { BarChart3 } from "lucide-react";
import { useState } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
};

export function DashboardHeader({
  title,
  description,
}: PageHeaderProps) {
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const { logout } = useLogout();

  return (
    <div className="w-full border-b px-7 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        
        {/* Left: Title & Description */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#11B8A2]/20 border border-[#11B8A2]">
              <BarChart3 className="h-5 w-5 text-[#0B8576] dark:text-[#4EDCC8]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl font-bold tracking-tight">
                {title}
              </h1>
            </div>
          </div>
        </div>
        <div>
          <div className="flex flex-row items-center justify-center gap-3">
            <ThemeToggle />

            <Button
              variant="outline"
              onClick={() => setOpenLogoutDialog(true)}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      {/* Logout Dialog Component */}
      <ConfirmDialog
        open={openLogoutDialog}
        title={"Logout"}
        description="Are you sure you want to logout from your account?"
        actionText="Logout"
        actionLoadingText="Logging out..."
        onCancel={() => setOpenLogoutDialog(false)}
        onConfirm={logout}
      />
    </div>
  );
}