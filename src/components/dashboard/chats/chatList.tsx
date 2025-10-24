"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoreVertical, Search } from "lucide-react";
import { useChatsContext } from "@/hooks/chat/ChatsContext";
import { formatTime } from "@/utiles/formatTime/formatTime";
import ChatMenu from "./ChatMenu";
import ContactAvatar from "../contacts/ContactAvatar";
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/common/useDebounce";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

export default function ChatList() {
  const {
    chats,
    setChats,
    loading,
    loadingMore,
    hasMore,
    activeChat,
    setActiveChat,
    sidebarRef,
    refreshChats,
    searchChats,
  } = useChatsContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const formatPhone = ( number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  }

  const handleOpenChat = async (chat: any) => {
    setActiveChat(chat);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat._id !== chatId));
    if(activeChat?._id == chatId) {
      setActiveChat(null);
    }
  };

  const handleSearch = useCallback(
    async (term: string) => {
      if (term.trim()) {
        setIsSearching(true);
        await searchChats(term); // <-- hook should implement this like `searchContacts`
        setIsSearching(false);
      } else {
        refreshChats();
      }
    },
    []
  );

  useEffect(() => {
    handleSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, handleSearch]);

  const handleClearSearch = () => {
    setSearchTerm("");
    refreshChats();
  };

  return (
    <div className="bg-white dark:bg-[#161717] min-h-screen border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">WA API</h1>
        <div
          className={`w-10 h-10 flex items-center justify-center rounded-full dark:hover:bg-[#252727] hover:bg-gray-200`}
          >
          <MoreVertical  size={22}/>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-5">
        <div className="relative z-10">
          <Search className="absolute left-3 top-2.5 h-4 w-6 text-gray-500" size={22} strokeWidth={2} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              p-1.5
              pl-12 rounded-full
              bg-gray-200 dark:bg-[#2E2F2F]
              border border-transparent
              focus:border-2 focus:border-white
              focus:outline-none
              placeholder:text-base placeholder:text-gray-400
              dark:text-white
              w-full
            "
          />
          {searchTerm && (
            <Button
              variant="ghost"
              onClick={handleClearSearch}
              className="absolute right-0 top-0 text-gray-500 hover:text-gray-700 hover:bg-transparent"
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Search Status */}
      {searchTerm && (
        <div className="px-5 py-2 border-b text-sm flex justify-between items-center">
          <span className="text-gray-600">
            {isSearching
              ? "Searching..."
              : `Search results for "${searchTerm}"`}
          </span>
          <button
            onClick={handleClearSearch}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Clear
          </button>
        </div>
      )}

      {/* Chat List */}
      <div ref={sidebarRef} className="flex-1 overflow-y-auto mt-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center p-4 mx-3 mb-1">
              <Skeleton className="w-12 h-12 rounded-full mr-3" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-4 w-48 rounded" />
              </div>
              <Skeleton className="h-4 w-10 ml-2 rounded" />
            </div>
          ))
        ) : chats.length === 0 ? (
          <div className="p-8 text-center">No chats found.</div>
        ) : (
          chats.map((chat) => {
            const isBroadcast = chat.type === "broadcast";
            const partner = chat.participants[0];
            const isActive = chat._id === activeChat?._id
            const displayName = isBroadcast
              ? chat.chatName || "Broadcast"
              : partner?.name || formatPhone(String(partner?.number)) || "Unknown";

            const displayImage = isBroadcast
              ? chat?.chatImage
              : partner?.imageUrl;
            return (
              <div
                key={chat._id}
                onClick={() => handleOpenChat(chat)}
                className={`mx-3 mb-1 rounded-lg group flex items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2E2F2F] transition-colors ${
                  isActive ? "bg-gray-100 dark:bg-[#2E2F2F]" : ""
                }`}
              >
                {/* Avatar */}
                <ContactAvatar
                  imageUrl={displayImage}
                  title={displayName}
                  subtitle={chat.lastMessage || "No messages yet"}
                  size="xl"
                  isGroup={isBroadcast}
                />

                {/* Right Side */}
                <div className="flex-1 flex flex-col items-end">
                  <span
                      className={`text-xs ${
                        (chat?.unreadCount ?? 0) > 0 ? "text-green-500 font-medium" : "text-gray-500"
                      }`}
                    >
                    {formatTime(chat.lastMessageAt)}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-5 h-5" />
                    {/* Simple circle with unread count */}
                    {(chat?.unreadCount ?? 0) > 0 && (
                      <div
                        className={`flex items-center justify-center min-w-[20px] px-1.5 h-5 bg-green-500 dark:bg-green-700 text-white text-xs font-medium rounded-full`}
                      >
                        {(chat?.unreadCount ?? 0) > 99 ? "99+" : chat.unreadCount}
                      </div>
                    )}
                    <ChatMenu chatId={chat._id} onDelete={handleDeleteChat} />
                  </div>
                </div>
              </div>
            );
          })
        )}

        {hasMore &&
          loadingMore &&
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center p-4 mx-3 mb-1">
              <Skeleton className="w-12 h-12 rounded-full mr-3" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-4 w-48 rounded" />
              </div>
              <Skeleton className="h-4 w-10 ml-2 rounded" />
            </div>
          ))}
      </div>
    </div>
  );
}
