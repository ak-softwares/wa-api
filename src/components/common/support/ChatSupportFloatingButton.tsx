"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const SUPPORT_URL =
  "https://wa.me/918077030731?text=Hi%20I%20need%20support%20regarding%20WA-API";

export default function ChatSupportFloatingButton() {
  const { status } = useSession();
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <a
      href={SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with support on WhatsApp"
      className="fixed right-4 bottom-6 z-50 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-lg ring-1 ring-emerald-200 transition hover:scale-[1.02] hover:bg-emerald-50 dark:bg-gray-900 dark:text-emerald-300 dark:ring-emerald-900"
    >
      <Image
        src="/assets/logos/whatsapp.svg"
        alt="WhatsApp"
        width={20}
        height={20}
      />
      <span>Chat with support</span>
    </a>
  );
}
