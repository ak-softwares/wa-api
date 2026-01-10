"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  onClick?: () => void;
}

export function RefreshButton({ onClick }: RefreshButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(); // ✅ custom action
    } else {
      window.location.reload(); // 🔄 fallback refresh
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <RefreshCw className="h-4 w-4 mr-2" />
      Refresh
    </Button>
  );
}
