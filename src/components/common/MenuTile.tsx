"use client";

import { ReactNode } from "react";

interface MenuTileProps {
  icon: ReactNode;
  label: string;
  subtitle?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  selected?: boolean; // 👈 added
}

export default function MenuTile({
  icon,
  label,
  subtitle,
  onClick,
  size = "lg",
  selected = false,
}: MenuTileProps) {
  const sizeConfig = {
    sm: { box: "h-8 w-8", text: "text-sm", sub: "text-[11px]" },
    md: { box: "h-10 w-10", text: "text-md", sub: "text-xs" },
    lg: { box: "h-12 w-12", text: "text-lg", sub: "text-[15px]" },
  };

  const cfg = sizeConfig[size];

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer
        hover:bg-gray-50 dark:hover:bg-[#2E2F2F]
        ${selected ? "border-l-4 border-green-500 bg-gray-50 dark:bg-[#2E2F2F]" : ""}
      `}
    >
      <div className={`${cfg.box} flex items-center justify-center rounded-full`}>
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className={`${cfg.text} truncate`}>{label}</div>
        {subtitle && (
          <div className={`${cfg.sub} text-gray-400 truncate`}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
