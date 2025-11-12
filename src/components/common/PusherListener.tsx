"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PusherListener() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // console.log("user id: " + session?.user?.id);
    // console.log("Full user object:", session?.user);
    if (status !== "authenticated" || !session?.user?.id) return;

    // Initialize once per login
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Subscribe to all user events
    const channel = pusher.subscribe(`user-${session.user.id}`);

    channel.bind("new-message", (data: any) => {
      toast.message(data.message.from, {
        description: data.message.message,
        duration: 5000,
        action: {
          label: "View",
          onClick: () =>
            router.push(`/dashboard/messages?phone=${data.message.from}`),
        },
      });
    });

    return () => {
      pusher.unsubscribe(`user-${session.user.id}`);
      pusher.disconnect();
    };
  }, [status, session?.user?.id, router]);

  return null;
}
