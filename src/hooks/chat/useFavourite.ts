"use client";

import { useState } from "react";
import { showToast } from "@/components/ui/sonner";

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
        showToast.success(json.message);
        return json.data.isFavourite; // return new state
      } else {
        showToast.error(json.message || "Failed to update favourite");
        return null;
      }
    } catch (error) {
      showToast.error("Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { toggleFavourite, loading };
};
