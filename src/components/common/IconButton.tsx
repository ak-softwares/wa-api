"use client";

import React, { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface IconButtonProps {
  label: string;
  IconSrc: string;
  size?: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
  onClick?: () => void;
  disabled?: boolean;
  isActive?: boolean;
  asChild?: boolean;
  className?: string;
  // allow spreading extra props (like aria, id, etc.)
  [key: string]: any;
}

/**
 * Exports a forwardRef IconButton so parent triggers can attach refs.
 * - If asChild: returns a Slot-wrapped button so parent (DropdownMenuTrigger) can become the trigger.
 * - If not asChild: returns the button wrapped in TooltipProvider/Tooltip as before.
 */
const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    label,
    IconSrc,
    size = "w-6 h-6",
    tooltipSide = "bottom",
    onClick,
    disabled = false,
    isActive,
    asChild = false,
    className = "",
    ...rest
  },
  ref
) {
  const opacityClass =
    isActive === undefined
      ? "opacity-100"
      : isActive
      ? "opacity-100 dark:opacity-100"
      : "opacity-70";

  const btnClass = `w-10 h-10 flex items-center justify-center rounded-full transition
    ${isActive ? "bg-gray-200 dark:bg-[#252727]" : "hover:dark:bg-[#252727] hover:bg-gray-200"}
    ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
    ${className}`;

  // The actual button element. Attach ref here so parent triggers can forward refs.
  const buttonElement = (
    <button
      ref={ref}
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={btnClass}
      {...rest}
    >
      <img src={IconSrc} className={`${size} dark:invert ${opacityClass}`} alt={label} />
    </button>
  );

  // If used as a child (e.g., inside DropdownMenuTrigger asChild), *do not* wrap with tooltip or extra div.
  if (asChild) {
    return <Slot>{buttonElement}</Slot>;
  }

  // Default: show tooltip and wrap with a container for mouse events
  return (
    <div className="flex justify-center" onMouseEnter={() => {}} onMouseLeave={() => {}}>
      <TooltipProvider>
        {/* TooltipTrigger asChild — it will pass necessary props to our buttonElement */}
        <Tooltip>
          <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
          <TooltipContent side={tooltipSide}>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
});

export default IconButton;
