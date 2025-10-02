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

export default function MessageBox() {
  const { activeChat, setActiveChat } = useChatsContext();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // ✅ Correct destructuring
  const { messages, onSend, loading, loadingMore, hasMore } = useMessages({ containerRef, activeChat });
  
  const [message, setMessage] = useState("");

  const messageSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const backFromChat = () => {
    setActiveChat(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("phone"); // <-- remove phone instead of setting it
    router.push(`?${params.toString()}`, { scroll: false });
  };

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

  return (
    <div className="flex flex-col min-h-screen">
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
          {/* Reusable avatar */}
          <ContactAvatar
            imageUrl={activeChat.participants[0]?.imageUrl}
            title={activeChat.participants[0]?.name || "Unknown"}
            size="md"
          />
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          <Video className="h-5 w-5" />
        </div>
      </div>

      {/* Messages list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 bg-green-50 dark:bg-gray-800 flex flex-col-reverse"
      >
        <div className="space-y-3 flex flex-col-reverse">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => {
                const isMine = i % 2 === 0;
                const messageLength = [3, 2, 4, 1, 3][i % 5]; // Varying message lengths
                
                return (
                    <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"} p-2 animate-pulse`}>
                    <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                        isMine 
                        ? "bg-green-100 dark:bg-green-900/40 rounded-br-none w-3/6" 
                        : "bg-white dark:bg-gray-900 rounded-bl-none w-3/5"
                    }`}>
                        {/* Dynamic message lines based on length */}
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
                        
                        {/* Timestamp */}
                        <div className="flex justify-end mt-2">
                        <Skeleton className="w-12 h-2 rounded" />
                        </div>
                    </div>
                    </div>
                );
            })
            : messages.map((m) => {
                const isMine = !activeChat.participants.some(
                  (p) => p.id === m.from
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
                const messageLength = [3, 2, 4, 1, 3][i % 5]; // Varying message lengths
                
                return (
                    <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"} p-2 animate-pulse`}>
                    <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                        isMine 
                        ? "bg-green-100 dark:bg-green-900/40 rounded-br-none w-3/6" 
                        : "bg-white dark:bg-gray-900 rounded-bl-none w-3/5"
                    }`}>
                        {/* Dynamic message lines based on length */}
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
                        
                        {/* Timestamp */}
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
  );
}
