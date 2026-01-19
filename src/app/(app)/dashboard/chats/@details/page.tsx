"use client";

import BroadcastPage from "@/components/dashboard/broadcast/BroadcastPage";
import { useChatMenuStore } from "@/store/chatMenu";
import DefaultMessagePage from "@/components/dashboard/messages/pages/DefaultMessagePage";
import MessagePage from "@/components/dashboard/messages/pages/MessagePage";

export default function MessageDetailsPage() {
  const { chatMenu } = useChatMenuStore();

  if(chatMenu == "message-page"){
    return <MessagePage />
  } else if(chatMenu == "broadcast"){
    return <BroadcastPage />
  } else{
    return <DefaultMessagePage />
  }
}
