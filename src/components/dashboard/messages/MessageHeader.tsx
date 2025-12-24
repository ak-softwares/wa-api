"use client";

import { User2, Users2 } from "lucide-react";
import IconButton from "@/components/common/IconButton";
import MessagesMenu from "./MessagesMenu";
import { useChatStore } from "@/store/chatStore";
import { CountryCode, parsePhoneNumberFromString } from "libphonenumber-js";
import { useDeleteChats } from "@/hooks/chat/useDeleteChats";
import { useRouter } from "next/navigation";
import { useFavourite } from "@/hooks/chat/useFavourite";
import { useBlockedContacts } from "@/hooks/chat/useBlockedContacts";
import { Chat, ChatType } from "@/types/Chat";

interface MessagesHeaderProps {
  onAvatarClick?: () => void;
  onBack?: () => void;
}

export default function MessagesHeader({
  onAvatarClick,
  onBack,
}: MessagesHeaderProps) {
  const {activeChat, setActiveChat} = useChatStore();
  const { deleteChat } = useDeleteChats();
  const { toggleFavourite, loading: favouriteLoading } = useFavourite();
  const { isBlocked, toggleBlock, confirmBlockDialog } = useBlockedContacts();
  
  const router = useRouter();
  
  if (!activeChat) return null;
  
  const chatId = activeChat?._id?.toString() ?? "";
  const isFavourite = activeChat?.isFavourite;

  const formatPhone = ( number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  }

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

  // ✅ Determine chat type and details
  const isBroadcast = activeChat?.type === ChatType.BROADCAST
  const partner = activeChat!.participants?.[0];
  const displayName = isBroadcast
    ? activeChat!.chatName || ChatType.BROADCAST
    : partner?.name || formatPhone(String(partner?.number)) || "Unknown";

  const displayImage = isBroadcast
    ? activeChat.chatImage
    : partner?.imageUrl;

  // 👇 Add subtitle logic here
  const subtitle = isBroadcast
    ? `${activeChat.participants?.length || 0} members` // e.g. "29 members"
    : null;
  
    return (
    <div className="p-4 flex items-center justify-between bg-white dark:bg-[#161717]">
      {/* Left Section */}
      <div className="flex items-center">

        {/* Avatar + Name */}
        <button onClick={onAvatarClick} className="flex items-center">
          <div className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 bg-gray-200 dark:bg-[#242626]">
            {displayImage ? (
              <img
                src={displayImage}
                alt={displayName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : isBroadcast ? (
              <Users2 className="h-4 w-4 text-gray-400" />
            ) : (
              <User2 className="h-4 w-4 text-gray-400" />
            )}
          </div>

          <div className="min-w-0 flex-1 flex flex-col justify-center items-start ml-3">
            <div className="font-medium text-md truncate text-left leading-tight">
              {displayName}
            </div>

            {subtitle && (
              <div className="truncate text-gray-400 text-sm leading-tight mt-0.5 text-left">
                {subtitle}
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <IconButton label="Search" IconSrc="/assets/icons/search.svg" />

        <MessagesMenu
          onContactDetails={onAvatarClick}
          onCloseChat={onBack}
          onDeleteChat={handleDelete}
          isFavourite={isFavourite ?? false}
          onToggleFavourite={() => handleUpdateChat(activeChat._id!.toString(), { isFavourite: !activeChat.isFavourite })}
          onBlockToggle={() => toggleBlock(partner)}
          isBlocked={isBlocked(partner)}
        />
      </div>
      {confirmBlockDialog()}
    </div>
  );
}
