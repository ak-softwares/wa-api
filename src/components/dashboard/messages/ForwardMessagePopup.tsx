'use client';

import { useRef, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ContactAvatar from "../contacts/ContactAvatar";
import SearchBar from "@/components/common/SearchBar";
import IconButton from "@/components/common/IconButton";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import { Message } from "@/types/Message";
import { useSendWhatsappMessage } from "@/hooks/whatsapp/useSendWhatsappMessage";
import { useChatStore } from "@/store/chatStore";
import { useContacts } from "@/hooks/contact/useContacts";
import { useChats } from "@/hooks/chat/useChats";

import { Chat } from "@/types/Chat";
import { Contact } from "@/types/Contact";

interface ForwardMessagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message;
}

export default function ForwardMessagePopup({ isOpen, onClose, message }: ForwardMessagePopupProps) {
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // Tabs: "chats" | "contacts"
  const [activeTab, setActiveTab] = useState<"chats" | "contacts">("chats");

  // ----------- HOOKS --------------
  const {
    chats,
    loading: loadingChats,
    loadingMore: loadingMoreChats,
    hasMore: hasMoreChats,
    searchChats,
    refreshChats
  } = useChats({ sidebarRef });

  const {
    contacts,
    loading: loadingContacts,
    loadingMore: loadingMoreContacts,
    hasMore: hasMoreContacts,
    refreshContacts,
    searchContacts
  } = useContacts({ sidebarRef });

  const { sendMessage, sendMessageByPhone } = useSendWhatsappMessage();
  const { setNewMessageData } = useChatStore();

  // Selection
  const [selectedChats, setSelectedChats] = useState<Chat[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // ----------------------------
  // Auto-fetch on open
  // ----------------------------
  useEffect(() => {
    if (isOpen) {
      if (activeTab === "chats") refreshChats();
      else refreshContacts();
    } else {
      setIsSelectionMode(false);
      setSelectedChats([]);
      setSelectedContacts([]);
    }
  }, [isOpen, activeTab]);

  // ----------------------------
  // Util
  // ----------------------------
  const formatPhone = (number: string, defaultCountry: CountryCode = "IN") => {
    try {
      const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
      return phoneNumber ? phoneNumber.formatInternational() : number;
    } catch {
      return number;
    }
  };

  const formatAndJoinPhones = (phones: string[]) => {
    return phones
      .map(p => formatPhone(p))
      .join(", ");
  };

  // ----------------------------
  // Toggle select chat/contact
  // ----------------------------
  const toggleChatSelection = (chat: Chat) => {
    if (!isSelectionMode) setIsSelectionMode(true);

    setSelectedChats(prev =>
      prev.some(c => c._id === chat._id)
        ? prev.filter(c => c._id !== chat._id)
        : [...prev, chat]
    );
  };

  const toggleContactSelection = (contact: Contact) => {
    if (!isSelectionMode) setIsSelectionMode(true);

    setSelectedContacts(prev =>
      prev.some(c => c._id === contact._id)
        ? prev.filter(c => c._id !== contact._id)
        : [...prev, contact]
    );
  };

  // ----------------------------
  // Send message based on tab
  // ----------------------------
  const handleSendForwardMessage = async () => {
    const forwardText = message.message || "";
    if (!forwardText.trim()) return;

    onClose();

    // CHAT TAB
    if (activeTab === "chats") {
      for (const chat of selectedChats) {
        await sendMessage(chat._id!.toString(), forwardText);
        setNewMessageData(message, chat);
      }
    }

    // CONTACT TAB
    if (activeTab === "contacts") {
      for (const contact of selectedContacts) {
        const response = await sendMessageByPhone(contact.phones[0], forwardText);
        if (response.success && response.data) {
          const { chat } = response.data;
          setNewMessageData(message, chat);
        }
      }
    }

    setSelectedChats([]);
    setSelectedContacts([]);
    setIsSelectionMode(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#161717] rounded-lg w-full max-w-md max-h-[80vh] min-h-[60vh] flex flex-col">

        {/* -------------- HEADER -------------- */}
        <div className="px-4 pt-4 pb-2 dark:border-[#333434]">
          <div className="flex items-center gap-4">
            <IconButton onClick={onClose} label="Back" IconSrc="/assets/icons/close.svg" />
            <h3 className="text-lg font-semibold">Forward message</h3>
          </div>

          {/* ---------------- TABS ---------------- */}
          <div className="flex mt-3 border-b dark:border-[#333434]">
            <button
              className={`flex-1 py-2 text-center ${
                activeTab === "chats" ? "border-b-2 border-green-500 font-semibold" : "opacity-60"
              }`}
              onClick={() => setActiveTab("chats")}
            >
              Chats
            </button>
            <button
              className={`flex-1 py-2 text-center ${
                activeTab === "contacts" ? "border-b-2 border-green-500 font-semibold" : "opacity-60"
              }`}
              onClick={() => setActiveTab("contacts")}
            >
              Contacts
            </button>
          </div>
        </div>

        {/* ---------------- SEARCH BAR ---------------- */}
        <SearchBar
          placeholder={activeTab === "chats" ? "Search chats..." : "Search contacts..."}
          onSearch={activeTab === "chats" ? searchChats : searchContacts}
        />

        {/* -------------- LIST -------------- */}
        <div ref={sidebarRef} className="flex-1 overflow-y-auto my-3">
          {activeTab === "chats" ? (
            <>
              {loadingChats ? (
                <LoadingList />
              ) : chats.length === 0 ? (
                <Empty text="No chats found." />
              ) : (
                chats.map(chat => {
                  const partner = chat.participants[0];
                  const isSelected = selectedChats.some(c => c._id === chat._id);

                  const name = partner?.name || formatPhone(partner?.number || "");

                  return (
                    <ListItem
                      key={chat._id!.toString()}
                      image={partner?.imageUrl}
                      title={name}
                      subtitle={chat.lastMessage}
                      selected={isSelected}
                      onClick={() => toggleChatSelection(chat)}
                      isSelectionMode={isSelectionMode}
                    />
                  );
                })
              )}

              {hasMoreChats && loadingMoreChats && <LoadingList small />}
            </>
          ) : (
            <>
              {loadingContacts ? (
                <LoadingList />
              ) : contacts.length === 0 ? (
                <Empty text="No contacts found." />
              ) : (
                contacts.map(contact => {
                  const isSelected = selectedContacts.some(c => c._id === contact._id);

                  return (
                    <ListItem
                      key={contact._id!.toString()}
                      image={contact.imageUrl}
                      title={contact.name || formatPhone(contact.phones[0])}
                      subtitle={formatAndJoinPhones(contact.phones)}
                      selected={isSelected}
                      onClick={() => toggleContactSelection(contact)}
                      isSelectionMode={isSelectionMode}
                    />
                  );
                })
              )}

              {hasMoreContacts && loadingMoreContacts && <LoadingList small />}
            </>
          )}
        </div>

        {/* ---------- FOOTER ---------- */}
        {(selectedChats.length > 0 || selectedContacts.length > 0) && (
          <div className="p-4 border-t dark:border-[#333434] flex justify-between items-center">
            <p className="text-sm">
              {activeTab === "chats"
                ? `${selectedChats.length} chat(s) selected`
                : `${selectedContacts.length} contact(s) selected`}
            </p>

            <IconButton
              IconSrc="/assets/icons/send-message.svg"
              onClick={handleSendForwardMessage}
              label="Send"
              className="bg-[#21C063] text-white"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ------------ SMALL COMPONENTS ---------------

const LoadingList = ({ small = false }: { small?: boolean }) => (
  <>
    {Array.from({ length: small ? 2 : 5 }).map((_, i) => (
      <div key={i} className="flex items-center p-4 mx-3 mb-1">
        <Skeleton className="w-12 h-12 rounded-full mr-3" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-4 w-48 rounded" />
        </div>
      </div>
    ))}
  </>
);

const Empty = ({ text }: { text: string }) => (
  <div className="p-8 text-center opacity-70">{text}</div>
);

const ListItem = ({
  image,
  title,
  subtitle,
  selected,
  onClick,
  isSelectionMode
}: any) => (
  <div className="mx-3">
    <ContactAvatar
      imageUrl={image}
      title={title}
      subtitle={subtitle}
      size="xl"
      isSelectionMode={isSelectionMode}
      isSelected={selected}
      onClick={onClick}
    />
  </div>
);
