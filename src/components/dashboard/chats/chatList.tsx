"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Menu as MenuIcon, Search } from "lucide-react";
import { useChatsContext } from "@/hooks/chat/ChatsContext";
import { formatTime } from "@/utiles/formatTime/formatTime";
import ChatMenu from "./ChatMenu";

export default function ChatList() {

  const { chats, setChats, loading, loadingMore, hasMore, activeChat, setActiveChat, sidebarRef } = useChatsContext();

  const handleChatClick = (chat: any) => {
    setActiveChat(chat);
    // const params = new URLSearchParams(searchParams.toString());
    // params.set('phone', chat.participants[0]?.id || "");
    // router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat._id !== chatId));
    setActiveChat(chats.length > 0 ? chats[0] : null);
  };

  return (
    <div className="w-1/3 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chats</h1>
        <Button variant="ghost" size="icon">
          <MenuIcon />
        </Button>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input placeholder="Search chats..." className="pl-10" />
        </div>
      </div>

      <div ref={sidebarRef} className="flex-1 overflow-y-auto">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center p-4 border-b">
                <Skeleton className="w-12 h-12 rounded-full mr-3" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-5 w-32 rounded" />
                  <Skeleton className="h-4 w-48 rounded" />
                </div>
                <Skeleton className="h-4 w-10 ml-2 rounded" />
              </div>
            ))
          : chats.length === 0
          ? <div className="p-8 text-center">No chats yet.</div>
          : chats.map(chat => {
              const partner = chat.participants[0];
              const isActive = partner?.id === activeChat?.participants[0]?.id;
              return (
                <div
                  key={chat._id}
                  onClick={() => handleChatClick(chat)}
                  className={`group flex items-center p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${isActive ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold mr-3">
                    {partner?.name?.charAt(0) || "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{partner?.name || "Unknown"}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end ml-4 mt-2">
                    <span className="text-xs text-gray-500">{formatTime(chat.lastMessageAt)}</span>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Unread badge */}
                      <span className="w-5 h-5">
                        {/* <span className="bg-green-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                          {chat.unreadCount || 0}
                        </span> */}
                      </span>
                      <ChatMenu chatId={chat._id} onDelete={handleDeleteChat} />
                    </div>
                  </div>
                </div>
              );
            })
        }

        {hasMore && loadingMore &&
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center p-4 border-b">
              <Skeleton className="w-12 h-12 rounded-full mr-3" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-4 w-48 rounded" />
              </div>
              <Skeleton className="h-4 w-10 ml-2 rounded" />
            </div>
          ))
        }
      </div>
    </div>
  );
}
