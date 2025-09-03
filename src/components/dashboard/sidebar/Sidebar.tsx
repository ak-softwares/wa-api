"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageSquare, BarChart2, Settings, Menu } from "lucide-react";

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 70 }}
      className="bg-white border-r shadow-sm flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b">
        {sidebarOpen && <h1 className="text-lg font-bold">WA API</h1>}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          <MessageSquare className="mr-2 w-5 h-5" />
          {sidebarOpen && "Messages"}
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <BarChart2 className="mr-2 w-5 h-5" />
          {sidebarOpen && "Analytics"}
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-2 w-5 h-5" />
          {sidebarOpen && "Settings"}
        </Button>
      </nav>
    </motion.aside>
  );
}
