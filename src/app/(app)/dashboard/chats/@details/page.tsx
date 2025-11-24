"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { useMessages } from "@/hooks/message/useMessages";
import { Skeleton } from "@/components/ui/skeleton";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import { useTheme } from "next-themes"; // if using next-themes
import IconButton from "@/components/common/IconButton";
import { useChatStore } from "@/store/chatStore";
import DefaultChatPage from "@/components/dashboard/chats/defaultChatPage";
import { User2, Users2 } from "lucide-react";
import ContactDetails from "@/components/dashboard/chats/ContactDetails";
import MessagesMenu from "@/components/dashboard/messages/MessagesMenu";
import MessageBubble from "@/components/common/MessageBubble";
import { useDeleteChats } from "@/hooks/chat/useDeleteChats";
import { useRouter } from "next/navigation";
import { Message } from "@/types/Message";
import { Chat } from "@/types/Chat";
import { useFavourite } from "@/hooks/chat/useFavourite";

export default function MessagePage() {
  const { theme } = useTheme(); // or use your theme context
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {activeChat, setActiveChat} = useChatStore();
  const router = useRouter();

  const chatId = activeChat?._id?.toString() ?? "";

  const [message, setMessage] = useState("");
  const [messageContext, setMessageContext] = useState<Message | null>(null);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const { messages, setMessages, onSend, loading, loadingMore, hasMore } = useMessages({ containerRef, chatId });
  const { deleteChat } = useDeleteChats();
  const { toggleFavourite, loading: favouriteLoading } = useFavourite();

  // ✅ Reset unread count when chat is opened
  useEffect(() => {
    if (!chatId) return;

    fetch(`/api/whatsapp/chats/${chatId}/opened`, { method: "POST" });

    // ✅ When leaving the chat
    return () => {
      fetch(`/api/whatsapp/chats/${chatId}/closed`, { method: "POST" });
    };
  }, [chatId]);

  const messageSend = () => {
    if (message.trim()) {
        const payload: any = { text: message };

      // Only add context if messageContext exists
      if (messageContext) {
        payload.context = {
          id: messageContext.waMessageId,
          from: messageContext.from,
          message: messageContext.message,
        };
      }

      onSend(payload);
      setMessage("");
      setMessageContext(null);
    }
  };

  const onReply = (message: Message) => {
    setMessageContext(message);
  }

  useEffect(() => {
    // Whenever reply context changes → focus input after UI is updated
    inputRef.current?.focus();
  }, [messageContext]);

  const backFromChat = () => {
    setActiveChat(null);
    setMessageContext(null);
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

  const handleUpdateChat = async (chatId: string, updates: Partial<Chat> = {}) => {
    // If the update includes isFavourite, call the API
    if ("isFavourite" in updates) {
      const newFavouriteState = await toggleFavourite(chatId);
      if (newFavouriteState !== null) {
        updates.isFavourite = newFavouriteState; // update with server response
      } else {
        return; // exit if API failed
      }
    }

    // Update active chat if it matches
    if (activeChat && String(activeChat._id) === chatId) {
      setActiveChat({ ...activeChat, ...updates });
    }
  };


  const handleDeleteMessage = (MessageId: string) => {
    setMessages((prev) => prev.filter(message => String(message._id) !== MessageId));
  };

  // Close contact details when active chat changes
  useEffect(() => {
    setShowContactDetails(false);
  }, [activeChat]);

  
  const formatPhone = ( number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  }

  if(!activeChat){
    return <DefaultChatPage />
  }

  // ✅ Determine chat type and details
  const isBroadcast = activeChat!.type === "broadcast";
  const partner = activeChat!.participants?.[0];
  const displayName = isBroadcast
    ? activeChat!.chatName || "Broadcast"
    : partner?.name || formatPhone(String(partner?.number)) || "Unknown";

  const displayImage = isBroadcast
    ? activeChat.chatImage
    : partner?.imageUrl;

  // 👇 Add subtitle logic here
  const subtitle = isBroadcast
    ? `${activeChat.participants?.length || 0} members` // e.g. "29 members"
    : null;
    
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
               <div className="min-w-0 flex-1 flex flex-col justify-center items-start ml-3">
                  <div className="font-medium text-md truncate text-left leading-tight">
                    {displayName || "Unknown"}
                  </div>

                  {subtitle && (
                    <div className="truncate text-gray-400 text-sm leading-tight mt-0.5 text-left">
                      {subtitle}
                    </div>
                  )}
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
                isFavourite={activeChat.isFavourite}
                onToggleFavourite={() => handleUpdateChat(activeChat._id!.toString(), { isFavourite: !activeChat.isFavourite })}
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
                  : messages.map((m) => (
                    <MessageBubble 
                      key={m._id?.toString()}
                      message={m}
                      onDelete={handleDeleteMessage}
                      onReply={() => onReply(m)}
                    />))
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
              {/* PREFIX buttons (left side inside input) */}
              {messageContext && (
                <div className="p-2 dark:bg-[#2E2F2F] bg-white rounded-t-xl">
                  <div className="px-4 py-2 bg-gray-100 dark:bg-[#1f1f1f] rounded-md border-l-4 dark:border-blue-400 border-blue-600 flex justify-between items-start">
                    <div>
                      <p className="dark:text-blue-300 text-blue-600 font-semibold text-sm">
                        {activeChat.participants[0]?.name ?? "User"}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-1">
                        {messageContext.message}
                      </p>
                    </div>

                    {/* Close button */}
                    <button
                      onClick={() => setMessageContext(null)}
                      className="dark:text-gray-400 text-gray-600 hover:text-black dark:hover:text-white text-2xl px-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              <div className="relative flex items-center">
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
                  ref={inputRef}   // 👈 attach ref
                  placeholder="Type a message"
                  className={`
                    flex-1
                    px-25
                    bg-white
                    ${messageContext ? "rounded-t-none rounded-b-3xl" : "rounded-full"}
                    dark:bg-[#2E2F2F]
                    h-12
                    border-none
                    !focus:ring-0 !focus-visible:ring-0 !ring-0
                    !focus:border-transparent 
                    !active:border-transparent !hover:border-transparent 
                    !outline-none !focus:outline-none
                    placeholder:text-base placeholder:text-gray-400
                    dark:text-white
                    !text-base
                  `}
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