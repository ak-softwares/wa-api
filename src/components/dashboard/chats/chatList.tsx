"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useChatsContext } from "@/hooks/chat/ChatsContext";
import { formatTime } from "@/utiles/formatTime/formatTime";
import ChatMenu from "./ChatMenu";
import ContactAvatar from "../contacts/ContactAvatar";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import ChatsMenu from "../contacts/ChatsMenu";
import SearchBar from "@/components/common/SearchBar";
import { useRouter } from "next/navigation";
import { useState } from "react";
import IconButton from "@/components/common/IconButton";
import { toast } from "@/components/ui/sonner";
import { useDeleteChats } from "@/hooks/chat/useDeleteChats";
import SelectedChatMenu from "./SelectedChatsMenu";

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

  const router = useRouter();
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { deleteChat, deleteChatsBulk, deleting } = useDeleteChats();
  
  
  const formatPhone = ( number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  }

  const handleOpenChat = async (chat: any) => {
    setActiveChat(chat);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter(chat => String(chat._id) !== chatId));
    if(String(activeChat?._id) === chatId) {
      setActiveChat(null);
    }
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedChatIds([]);
    setIsSelectionMode(false);
  };

  const goToChat = (id: string) => {
    router.push(`/dashboard/chats/${id}`);
  };

  const handleDelete = (deletedId: string) => {
    setChats((prev) => prev.filter((c) => c._id!.toString() !== deletedId));
    // refreshContacts();
  };

  const handleDeleteSelected = async () => {
    if (!selectedChatIds || selectedChatIds.length === 0) {
      toast.error("No contacts selected");
      return;
    }

    const success = await deleteChatsBulk(selectedChatIds);
    if (success) {
      // ✅ Remove deleted contacts from UI
      setChats((prev) =>
        prev.filter((c) => !selectedChatIds.includes(c._id!.toString()))
      );
      clearSelection?.(); // ✅ Optionally clear selection state
    }
  };

  // Select all chats
  const selectAllChats = () => {
    setSelectedChatIds(chats.map(chat => chat._id!.toString()));
  };

  // Toggle contact selection
  const toggleContactSelection = (contactId: string) => {
    setSelectedChatIds(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };


  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chat <span className="text-gray-500 text-sm">({0})</span></h1>
        <div className="flex items-center gap-2">
          <ChatsMenu onSelectChats={() => setIsSelectionMode(true)} />
        </div>
      </div>

      {/* Selection Mode */}
      {isSelectionMode && (
        <div>
          <div className="px-4 py-2 mb-2 flex items-center justify-between bg-gray-100 dark:bg-[#1E1F1F] border-b border-t border-gray-300 dark:border-[#333434]">
            <div className="flex items-center gap-3">
              <IconButton
                onClick={clearSelection}
                label={"Close Selection"}
                IconSrc={"/assets/icons/close.svg"}
              />
              <h2 className="text-lg">{selectedChatIds.length} selected</h2>
            </div>
            <SelectedChatMenu
              onDeleteSelected={handleDeleteSelected}
              onSelectAll={selectAllChats} 
            />
          </div>
        </div>
      )}

      {/* Search Bar */}
      <SearchBar
          placeholder="Search contacts..."
          onSearch={searchChats}
      />

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
            const isSelected = selectedChatIds.includes(chat._id!.toString());
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
                key={chat._id!.toString()}
                className={"mx-3"} 
              >
                {/* Avatar */}
                <ContactAvatar
                  imageUrl={displayImage}
                  title={displayName}
                  subtitle={chat.lastMessage || "No messages yet"}
                  size="xl"
                  isGroup={isBroadcast}
                  isSelectionMode={isSelectionMode}
                  isSelected={isSelected}
                  onClick={() =>
                    isSelectionMode
                      ? toggleContactSelection(chat._id!.toString())
                      : goToChat(chat._id!.toString())
                  }
                  rightMenu={
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
                        <ChatMenu chatId={chat._id!.toString()} onDelete={handleDeleteChat} />
                      </div>
                    </div>
                  }
                />
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
