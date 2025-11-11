"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import clsx from "clsx";

interface MenuItem {
  icon: string;
  label: string;
  action?: () => void;
  danger?: boolean;
}

interface MenuItemsListProps {
  items: MenuItem[];
}

export default function MenuItemsList({ items }: MenuItemsListProps) {
  return (
    <>
      {items.map((item, i) => (
        <DropdownMenuItem
          key={i}
          className={clsx(
            "flex items-center gap-2 cursor-pointer opacity-70 text-[14.5px]",
            item.danger
              ? "hover:dark:bg-[#291D21] hover:bg-[#513B41] hover:text-red-400"
              : "hover:dark:bg-[#343636] hover:bg-gray-100 dark:hover:bg-[#343636]"
          )}
          onClick={item.action}
        >
          <img
            src={item.icon}
            alt={item.label}
            className={clsx(
              "w-6 h-6 dark:invert opacity-80 mr-1",
              item.danger && "filter-none invert-0"
            )}
          />
          {item.label}
        </DropdownMenuItem>
      ))}
    </>
  );
}
