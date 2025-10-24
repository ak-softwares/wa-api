"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BookTemplate, BookOpen,        
  Brain, Cpu,                
  Megaphone, Volume2,    
} from "lucide-react"
import { ThemeToggle } from "@/components/global/header/themeToggle"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Sidebar() {
  const pathname = usePathname()
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  
  const topLinks = [
    { href: "/dashboard/chats", label: "Chats", icon: { active: "/assets/icons/chat-active.svg", inactive: "/assets/icons/chat.svg" }, size: "w-6 h-6" },
    { href: "/dashboard/contacts", label: "Contacts", icon: { active: "/assets/icons/contacts-active.svg", inactive: "/assets/icons/contacts.svg" }, size: "w-8 h-8" },
    { href: "/dashboard/templates", label: "Templates", icon: { active: "/assets/icons/template.svg", inactive: "/assets/icons/template.svg" }, size: "w-6 h-6" },
  ]


  const middleLinks = [
    { href: "/dashboard/ai-agent", label: "AI Agent", icon: { active: "/assets/icons/ai-agent.svg", inactive: "/assets/icons/ai-agent.svg" }, size: "w-6 h-6" },
    // { href: "/dashboard/campaigns", label: "Campaigns", icon: { active: Volume2, inactive: Megaphone }, size: "w-6 h-6" },
  ]

  const bottomLinks = [
    { href: "/dashboard/settings", label: "Settings", icon: { active: "/assets/icons/setting-active.svg", inactive: "/assets/icons/setting.svg" }, size: "w-6 h-6" },
    { href: "/dashboard/profile", label: "Profile", icon: { active: "/assets/icons/user-default.svg", inactive: "/assets/icons/user-default.svg" }, size: "w-7 h-7" },
  ]


  const renderLink = (href: string, label: string, icon: { active: any; inactive: any }, size: string) => {
    const IconSrc = pathname === href ? icon.active : icon.inactive

    return (
      <div
        key={href}
        className="flex justify-center"
        onMouseEnter={() => setActiveTooltip(label)}
        onMouseLeave={() => setActiveTooltip(null)}
      >

        {/* Tooltip */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Your trigger element */}
              <Link href={href}>
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full
                    ${pathname === href
                      ? "bg-gray-200 dark:bg-[#252727]" 
                      : "hover:dark:bg-[#252727] hover:bg-gray-200"}`}
                >
                  <img 
                    src={IconSrc} 
                    className={`${size} dark:invert opacity-70 ${pathname === href ? "dark:opacity-100" : ""}`} 
                    alt={label} 
                  />
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }


  return (
    <motion.aside
      animate={{ width: 70 }}
      className="bg-gray-50 dark:bg-[#1D1F1F] text-white flex flex-col items-center justify-between py-2 border-r border-gray-200 dark:border-[#2a3942] h-screen sticky top-0"
    >
      <div className="flex flex-col items-center space-y-2 w-full">
        {/* Top Section */}
        <div className="flex flex-col items-center space-y-2">
          {topLinks.map(({ href, label, icon, size }) => renderLink(href, label, icon, size))}
        </div>

        {/* Divider */}
        <div className="w-10 border-t dark:border-[#2a3942] border-gray-300 my-3 items-center" />

        {/* Middle Section */}
        <div className="flex flex-col items-center space-y-2">
          {middleLinks.map(({ href, label, icon, size }) => renderLink(href, label, icon, size))}
        </div>
      </div>


      {/* Divider */}
      {/* <div className="w-8 border-t border-[#2a3942] my-3" /> */}

      {/* Bottom Section */}
      <div className="flex flex-col items-center space-y-2">
        <ThemeToggle />
          {bottomLinks.map(({ href, label, icon, size }) => renderLink(href, label, icon, size))}
      </div>
    </motion.aside>
  )
}
