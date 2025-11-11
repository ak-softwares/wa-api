"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/utiles/formatTime/formatTime";
import { useMessages } from "@/hooks/chat/useMessages";
import { Skeleton } from "@/components/ui/skeleton";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import { useTheme } from "next-themes"; // if using next-themes
import { ChatParticipant } from "@/types/Chat";
import IconButton from "@/components/common/IconButton";
import { useChatStore } from "@/store/chatStore";
import DefaultChatPage from "@/components/dashboard/chats/defaultChatPage";
import { User2, Users2 } from "lucide-react";
import ContactDetails from "@/components/dashboard/chats/ContactDetails";
import MessagesMenu from "@/components/dashboard/messages/MessagesMenu";
import MessageBubble from "@/components/common/MessageBubble";
import { useDeleteChats } from "@/hooks/chat/useDeleteChats";
import { useRouter } from "next/navigation";

export default function MessagePage() {
  const { theme } = useTheme(); // or use your theme context
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedChat = useChatStore((s) => s.selectedChat);
  const setSelectedChat = useChatStore((s) => s.setSelectedChat);
  const router = useRouter();

  const chatId = selectedChat?._id?.toString() ?? "";

  const [message, setMessage] = useState("");
  const [showContactDetails, setShowContactDetails] = useState(false);
  const { messages, onSend, loading, loadingMore, hasMore } = useMessages({ containerRef, chatId });
  const { deleteChat, deleteChatsBulk, deleting } = useDeleteChats();


  const messageSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const backFromChat = () => {
    setSelectedChat(null);
    setShowContactDetails(false);
  };

  const handleAvatarClick = () => {
    setShowContactDetails(true);
  };

  const handleDelete = async () => {
    if (!chatId) return;
    const success = await deleteChat(chatId);
    if (success) {
      // onDelete?.(chatId); // ✅ refresh or remove from UI
      router.refresh(); // 🔄 re-fetches data for the current route
    }
  };

  // Close contact details when active chat changes
  useEffect(() => {
    setShowContactDetails(false);
  }, [selectedChat]);

  
  const formatPhone = ( number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  }

  if(!selectedChat){
    return <DefaultChatPage />
  }

  // ✅ Determine chat type and details
  const isBroadcast = selectedChat!.type === "broadcast";
  const partner = selectedChat!.participants?.[0];
  const displayName = isBroadcast
    ? selectedChat!.chatName || "Broadcast"
    : partner?.name || formatPhone(String(partner?.number)) || "Unknown";

  const displayImage = isBroadcast
    ? selectedChat.chatImage
    : partner?.imageUrl;

  return (
    <div className="flex flex-col h-full">
      {/* Main chat area with contact details */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className={`flex flex-col min-w-0 ${showContactDetails ? 'flex-1' : 'w-full'}`}>
          {/* Chat header */}
          <div className="p-4 flex items-center justify-between bg-white dark:bg-[#161717]">
            <div className="flex items-center">
              {/* <Button
                variant="ghost"
                size="icon"
                className="mr-4"
                onClick={backFromChat}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button> */}
              {/* Clickable avatar */}
              <button onClick={handleAvatarClick} className="flex items-center">
                {/* Avatar */}
                <div
                  className={"h-10 w-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 bg-gray-200 dark:bg-[#242626]"}
                >
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={displayName || "Unknown"}
                      className={"h-10 w-10 rounded-full object-cover"}
                    />
                  ) : isBroadcast ? (
                    <Users2 className={"h-4 w-4 text-gray-400"} />
                  ) : (
                    <User2 className={"h-4 w-4 text-gray-400"} />
                  )}
                </div>

                {/* Text Content */}
                <div className="min-w-0 flex-1 flex flex-col justify-center ml-3">
                  <div className={"font-medium text-md truncate text-left leading-tight"}>
                    {displayName || "Unknown"}
                  </div>
                  {/* {subtitle && (
                    <div className={`truncate ${config.subtitle} text-gray-400 leading-tight mt-0.5`}>
                       // subtitle={isBroadcast ? "Broadcast list" : "last seen today at 11:17 am"}
                    </div>
                  )} */}
                </div>

              </button>
            </div>
            <div className="flex items-center gap-2">
              <IconButton
                // onClick={clearSelection}
                label={"Search"}
                IconSrc={"/assets/icons/search.svg"}
              />
              <MessagesMenu
                onContactDetails={handleAvatarClick}
                onCloseChat={backFromChat}
                onDeleteChat={handleDelete}
              />
            </div>
          </div>

          <div
            className="flex flex-col flex-1 overflow-hidden bg-[#FAF7F4] dark:bg-[#161717]"
            style={{
              backgroundImage: "url('/assets/whatsapp/message-bg.png')",
              backgroundRepeat: "repeat",
              backgroundSize: "auto",
              backgroundAttachment: "fixed",
              backgroundPosition: "top",
              // backgroundBlendMode: "overlay", // ✅ makes the image blend without changing div content opacity
              ...(theme === 'dark' 
                ? {
                    backgroundBlendMode: "overlay",
                  }
                : {
                    backgroundBlendMode: "difference", // or "soft-light" for light mode
                    backgroundColor: "rgba(250, 247, 244, 0.07)", // subtle white overlay
                  }
              )
            }}
          >
            {/* Messages list */}
            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto p-4 px-10 flex flex-col-reverse"
            >
              <div className="space-y-3 space-y-reverse flex flex-col-reverse"
              >
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => {
                      const isMine = i % 2 === 0;
                      const messageLength = [3, 2, 4, 1, 3][i % 5];
                      
                      return (
                          <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"} p-2 animate-pulse`}>
                          <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                              isMine 
                              ? "bg-green-100 dark:bg-[#144D37] rounded-tr-none w-3/6" 
                              : "bg-white dark:bg-[#2E2F2F] rounded-tl-none w-3/5"
                          }`}>
                              <div className="space-y-2">
                              {Array.from({ length: messageLength }).map((_, lineIndex) => (
                                  <Skeleton 
                                  key={lineIndex} 
                                  className={`h-3 rounded ${
                                      lineIndex === messageLength - 1 ? 'w-3/5' : 'w-full'
                                  }`} 
                                  />
                              ))}
                              </div>
                              <div className="flex justify-end mt-2">
                              <Skeleton className="w-12 h-2 rounded" />
                              </div>
                          </div>
                          </div>
                      );
                  })
                  : messages.map((m) => (<MessageBubble key={m._id?.toString()} message={m} />))
                  }
              </div>

              {/* Loader when fetching more (scroll up) */}
              {hasMore && loadingMore && (
                <div >
                  {Array.from({ length: 2 }).map((_, i) => {
                      const isMine = i % 2 === 0;
                      const messageLength = [3, 2, 4, 1, 3][i % 5];
                      
                      return (
                          <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"} py-2 animate-pulse`}>
                          <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                              isMine 
                              ? "bg-green-100 dark:bg-[#144D37] rounded-br-none w-3/6" 
                              : "bg-white dark:bg-[#2E2F2F] rounded-bl-none w-3/5"
                          }`}>
                              <div className="space-y-2">
                              {Array.from({ length: messageLength }).map((_, lineIndex) => (
                                  <Skeleton 
                                  key={lineIndex} 
                                  className={`h-3 rounded ${
                                      lineIndex === messageLength - 1 ? 'w-3/5' : 'w-full'
                                  }`} 
                                  />
                              ))}
                              </div>
                              <div className="flex justify-end mt-2">
                              <Skeleton className="w-12 h-2 rounded" />
                              </div>
                          </div>
                          </div>
                      );
                  })}
                </div>
              )}

            </div>
            {/* Input box */}
            <div className="bg-transparent p-4">
              <div className="relative flex items-center">
                {/* PREFIX buttons (left side inside input) */}
                <div className="absolute left-1.5 flex gap-2 items-center">
                  <IconButton
                    // onClick={clearSelection}
                    label={"Attach"}
                    IconSrc={"/assets/icons/plus.svg"}
                  />
                  <IconButton
                    // onClick={clearSelection}
                    label={"Emoji"}
                    IconSrc={"/assets/icons/emoji.svg"}
                  />
                </div>
                <Input
                  placeholder="Type a message"
                  className="
                    flex-1
                    px-25
                    mr-2 rounded-full bg-white 
                    dark:bg-[#2E2F2F]
                    h-12
                    border border-gray-200 dark:border-[#3a3b3b]
                    focus:ring-0
                    focus:ring-transparent
                    focus:border-none
                    focus:outline-none
                    placeholder:text-base placeholder:text-gray-400
                    dark:text-white
                    !text-base
                  "
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      messageSend();
                    }
                  }}
                />
                {/* Send button inside the input */}
                {/* SUFFIX buttons (right side inside input) */}
                <div className="absolute right-3 flex gap-2 items-center">
                  {
                    message.trim() === "" 
                      ? (
                        <IconButton
                            // onClick={clearSelection}
                            label={"Voice message"}
                            IconSrc={"/assets/icons/mic-outlined.svg"}
                        />
                      )
                      : (
                        <IconButton
                            onClick={messageSend}
                            label={"Send"}
                            IconSrc={"/assets/icons/send-message.svg"}
                        />
                      )
                  }
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Contact Details Panel */}
        <ContactDetails
          isOpen={showContactDetails} 
          onClose={() => setShowContactDetails(false)} 
        />
      </div>
    </div>
  );
}