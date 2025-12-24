"use client";

import { useEffect, useRef } from "react";
import Pusher from "pusher-js";
import { toast } from "@/components/ui/sonner";
import { Message } from "@/types/Message";

export function usePusherGlobalNotifications() {
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    if (!pusherRef.current) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        forceTLS: true,
      });
    }

    // ✅ subscribe to a single global channel
    const channel = pusherRef.current.subscribe("global-notifications");

    channel.bind("new-message", (data: { message: Message }) => {
      const msg = data.message;
      console.log("📩 New Pusher message received:", data);

      toast.default(`📨 New message from ${msg.from}`, {
        description: msg.message,
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusherRef.current?.disconnect();
    };
  }, []);
}
