"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/utiles/formatTime/formatTime";
import ChatMenu from "@/components/dashboard/chats/ChatMenu";
import ContactAvatar from "@/components/dashboard/contacts/ContactAvatar";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import ChatsMenu from "@/components/dashboard/chats/ChatsMenu";
import SearchBar from "@/components/common/SearchBar";
import { useState, useRef } from "react";
import IconButton from "@/components/common/IconButton";
import { toast } from "@/components/ui/sonner";
import { useDeleteChats } from "@/hooks/chat/useDeleteChats";
import SelectedChatMenu from "@/components/dashboard/chats/SelectedChatsMenu";
import { useChatStore } from "@/store/chatStore";
import { useChats } from "@/hooks/chat/useChats";
import NewChatPopup from "@/components/dashboard/chats/AppChatPopup";
import MakeBroadcastPopup from "@/components/dashboard/chats/MakeBroadcastPopup";
import { ChatFilterType } from "@/utiles/enums/chatFilters";
import { Chat, ChatParticipant } from "@/types/Chat";
import { useBlockedContacts } from "@/hooks/chat/useBlockedContacts";

export default function ChatList({
  searchParams,
}: {
  searchParams: { phone?: string };
}) {
  const phone = searchParams.phone || undefined;
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const { chats, totalChats, setChats, loading, loadingMore, hasMore, searchChats, filter, setFilter } = useChats({ sidebarRef, phone });

  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { deleteChatsBulk } = useDeleteChats();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isMakeBroadcastOpen, setIsMakeBroadcastOpen] = useState(false);
  const { activeChat, setActiveChat } = useChatStore();
  const { isBlocked, toggleBlock, ConfirmDialog } = useBlockedContacts();

  const FILTERS: { key: ChatFilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "favourite", label: "Favourite" },
    { key: "broadcast", label: "Broadcasts" },
  ];

  const formatPhone = ( number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  }

  const handleOpenChat = async (chat: any) => {
    setActiveChat(chat)
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter(chat => String(chat._id) !== chatId));
    if(String(activeChat?._id) === chatId) {
      setActiveChat(null);
    }
  };

  const handleUpdateChatFavourite = (chatId: string, isFavourite: boolean) => {
    setChats((prev) =>
      prev.map((chat) =>
        String(chat._id) === chatId
          ? { ...chat, isFavourite } // update favourite state
          : chat
      )
    );

    // If active chat is same, update its favourite as well
    if (String(activeChat?._id) === chatId) {
      setActiveChat({  ...(activeChat as Chat), isFavourite, });
    }
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedChatIds([]);
    setIsSelectionMode(false);
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
  const toggleContactSelection = (chatId: string) => {
    setSelectedChatIds(prev => 
      prev.includes(chatId) 
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chat <span className="text-gray-500 text-sm">({totalChats})</span></h1>
        <div className="flex items-center gap-2">
          <IconButton
            onClick={() => setIsNewChatOpen(true)}
            label={"Add chat"}
            IconSrc={"/assets/icons/chat-add.svg"}
          />
          <ChatsMenu 
            onSelectChats={() => setIsSelectionMode(true)} 
            onMakeBroadcast={() => setIsMakeBroadcastOpen(true)} 
          />
          {/* New Chat Popup */}
          <NewChatPopup
            isOpen={isNewChatOpen}
            onClose={() => setIsNewChatOpen(false)}
            phone={phone ?? ""} // Your phone prop
          />
          <MakeBroadcastPopup
            isOpen= {isMakeBroadcastOpen}
            onClose={() => setIsMakeBroadcastOpen(false)}
          />
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

      {/* Filter Chips (Unified Style) */}
      <div className="flex gap-2 px-6 mt-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`
              px-3 py-1 rounded-full text-sm font-semibold
              border-[0.1px] dark:border-gray-700 border-gray-300 transition
              dark:text-gray-300 text-gray-700
              ${
                filter === item.key
                  ? "dark:bg-[#11432F] bg-green-500 text-white border-transparent"
                  : ""
              }
            `}
          >
            {item.label}
          </button>
        ))}
      </div>


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
                className={"mx-3 mb-2"} 
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
                  isActive={isActive}
                  onClick={() =>
                    isSelectionMode
                      ? toggleContactSelection(chat._id!.toString())
                      : handleOpenChat(chat)
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
                        <ChatMenu
                          chat={chat} 
                          onDelete={handleDeleteChat}
                          onUpdateFavourite={handleUpdateChatFavourite}
                          onBlockToggle={() => toggleBlock(partner)}
                          isBlocked={isBlocked(partner)}
                        />
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
      <ConfirmDialog />
    </div>
  );
}
