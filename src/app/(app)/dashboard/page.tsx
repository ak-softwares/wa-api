'use client'

import RightBar from "@/components/dashboard/rightbar/RightBar";
import DashboardPage from "@/components/dashboard/dashboard/Dashboard"
import { DashboardHeader } from "@/components/dashboard/dashboard/DashboardHeader";


export default function Dashboard() {

  return (
    <main className="flex-1 overflow-y-auto dark:bg-[#161717]">
      <DashboardHeader
        title="Dashboard"
        description="Free plan includes 100 messages per month"
      />

      <div className="grid grid-cols-10 gap-6 p-6 h-full">
        {/* Left side (70%) */}
        <div className="col-span-7 space-y-6">
          {/* Stats */}
          <DashboardPage />
        </div>

        {/* Right side (30%) */}
        <div className="col-span-3 space-y-6">
          <RightBar />
        </div>
      </div>
    </main>
)

}
