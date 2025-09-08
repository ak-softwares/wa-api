"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageSquare, BarChart2, Settings, Menu, User, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
    { href: "/dashboard/profile", label: "Profile", icon: User, bottom: true },
  ]

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 70 }}
      className="bg-white dark:bg-gray-900 border-r shadow-sm flex flex-col"
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between p-4 border-b">
        {sidebarOpen && (
          <Link href="/">
            <h1 className="text-lg font-bold">WA API</h1>
          </Link>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-2">
        {links
          .filter((l) => !l.bottom)
          .map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={pathname === href ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Icon className="mr-2 w-5 h-5" />
                {sidebarOpen && label}
              </Button>
            </Link>
          ))}

        {/* Push Profile to bottom */}
        <div className="mt-auto">
          {links
            .filter((l) => l.bottom)
            .map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant={pathname === href ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="mr-2 w-5 h-5" />
                  {sidebarOpen && label}
                </Button>
              </Link>
            ))}
        </div>
      </nav>
    </motion.aside>
  )
}
