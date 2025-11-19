'use client'

import RightBar from "@/components/dashboard/rightbar/RightBar";
import DashboardPage from "@/components/dashboard/dashboard/Dashboard"


export default function Dashboard() {

  return (
    <main className="flex-1 p-6 overflow-y-auto dark:bg-[#161717]">
      <div className="grid grid-cols-10 gap-6 h-full">
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
