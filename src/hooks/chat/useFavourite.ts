"use client";

import { useState } from "react";
import { toast } from "@/components/ui/sonner";

export const useFavourite = () => {
  const [loading, setLoading] = useState(false);

  const toggleFavourite = async (chatId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wa-accounts/chats/${chatId}/favourite`, {
        method: "PATCH",
      });

      const json = await res.json();

      if (json.success) {
        toast.success(json.message);
        return json.data.isFavourite; // return new state
      } else {
        toast.error(json.message || "Failed to update favourite");
        return null;
      }
    } catch (error) {
      toast.error("Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { toggleFavourite, loading };
};
