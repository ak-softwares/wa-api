// components/chat/MessageBox.tsx (updated)
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, Phone, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/utiles/formatTime/formatTime";
import { useMessages } from "@/hooks/chat/useMessages";
import { useChatsContext } from "@/hooks/chat/ChatsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useRouter } from "next/navigation";
import ContactAvatar from "../contacts/ContactAvatar";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import ContactDetails from "./ContactDetails";

export default function MessageBox() {
  const { activeChat, setActiveChat } = useChatsContext();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showContactDetails, setShowContactDetails] = useState(false);

  // ✅ Correct destructuring
  const { messages, onSend, onBroadcastSend, loading, loadingMore, hasMore } = useMessages({ containerRef, activeChat });
  
  const [message, setMessage] = useState("");
  
  const formatPhone = ( number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  }

  const messageSend = () => {
    if (message.trim()) {
      if(activeChat?.type == "broadcast"){
        onBroadcastSend(message);
      }else{
        onSend(message);
      }
      setMessage("");
    }
  };

  const backFromChat = () => {
    setActiveChat(null);
    setShowContactDetails(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("phone");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleAvatarClick = () => {
    setShowContactDetails(true);
  };

  // Close contact details when active chat changes
  useEffect(() => {
    setShowContactDetails(false);
  }, [activeChat]);

  // ✅ Empty state if no active chat
  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-green-50 dark:bg-gray-900 p-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Your Messages
        </h2>
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  // ✅ Determine chat type and details
  const isBroadcast = activeChat.type === "broadcast";
  const partner = activeChat.participants?.[0];
  const displayName = isBroadcast
    ? activeChat.chatName || "Broadcast"
    : partner?.name || formatPhone(String(partner?.number)) || "Unknown";

  const displayImage = isBroadcast
    ? activeChat.chatImage
    : partner?.imageUrl;

  return (
    <div className="flex flex-col min-h-screen flex-1">
      {/* Main chat area with contact details */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className={`flex flex-col min-w-0 ${showContactDetails ? 'flex-1' : 'w-full'}`}>
          {/* Chat header */}
          <div className="p-4 flex items-center justify-between bg-white dark:bg-gray-900 border-b">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-4"
                onClick={backFromChat}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              {/* Clickable avatar */}
              <button onClick={handleAvatarClick} className="flex items-center">
                <ContactAvatar
                  imageUrl={displayImage}
                  title={displayName}
                  // subtitle={isBroadcast ? "Broadcast list" : "last seen today at 11:17 am"}
                  size="md"
                  isGroup={isBroadcast}
                />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 cursor-pointer" />
              <Video className="h-5 w-5 cursor-pointer" />
            </div>
          </div>

          {/* Messages list */}
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto p-4 bg-green-50 dark:bg-gray-800 flex flex-col-reverse"
          >
            <div className="space-y-3 space-y-reverse flex flex-col-reverse">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => {
                    const isMine = i % 2 === 0;
                    const messageLength = [3, 2, 4, 1, 3][i % 5];
                    
                    return (
                        <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"} p-2 animate-pulse`}>
                        <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                            isMine 
                            ? "bg-green-100 dark:bg-green-900/40 rounded-br-none w-3/6" 
                            : "bg-white dark:bg-gray-900 rounded-bl-none w-3/5"
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
                : messages.map((m) => {
                    const isMine = !activeChat.participants.some(
                      (p) => p.number === m.from
                    );
                    return (
                      <div
                        key={m._id}
                        className={`flex ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                            isMine
                              ? "bg-green-100 dark:bg-green-900/40 rounded-br-none"
                              : "bg-white dark:bg-gray-900 rounded-bl-none"
                          }`}
                        >
                          <p>{m.message}</p>
                          <p className="text-xs mt-1 text-right opacity-70">
                            {m.tag}
                            {formatTime(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
            </div>

            {/* Loader when fetching more (scroll up) */}
            {hasMore && loadingMore && (
              <div >
                {Array.from({ length: 2 }).map((_, i) => {
                    const isMine = i % 2 === 0;
                    const messageLength = [3, 2, 4, 1, 3][i % 5];
                    
                    return (
                        <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"} p-2 animate-pulse`}>
                        <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                            isMine 
                            ? "bg-green-100 dark:bg-green-900/40 rounded-br-none w-3/6" 
                            : "bg-white dark:bg-gray-900 rounded-bl-none w-3/5"
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
          <div className="bg-white dark:bg-gray-900 p-4 border-t">
            <div className="flex items-center">
              <Input
                placeholder="Type a message"
                className="flex-1 mr-2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    messageSend();
                  }
                }}
              />
              <Button
                onClick={messageSend}
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
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