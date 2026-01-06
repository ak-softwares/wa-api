"use client";

import { ThemeToggle } from "@/components/global/header/themeToggle";
import { BarChart3 } from "lucide-react";

type PageHeaderProps = {
  title: string;
  description?: string;
};

export function DashboardHeader({
  title,
  description,
}: PageHeaderProps) {

  return (
    <div className="w-full border-b px-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        
        {/* Left: Title & Description */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl font-bold tracking-tight">
                {title}
              </h1>
            </div>
          </div>
        </div>
        <div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}