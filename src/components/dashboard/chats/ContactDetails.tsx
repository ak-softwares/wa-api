// components/chat/ContactDetails.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Star, Ban, Trash2, CheckCircle2 } from "lucide-react";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import { useChatStore } from "@/store/chatStore";
import ContactAvatar from "../contacts/ContactAvatar";
import { useDeleteChats } from "@/hooks/chat/useDeleteChats";
import { useRouter } from "next/navigation";
import IconButton from "@/components/common/IconButton";
import { useAddContact } from "@/hooks/contact/useAddContact";
import { useState } from "react";
import AddContactsToBroadcastPopup from "./AddContactsToBroadcastPopup";
import ViewAllMembersPopup from "./ViewAllMembersPopup";
import MembersMenu from "./MembersMenu";
import { useBlockedContacts } from "@/hooks/chat/useBlockedContacts";

interface ContactDetailsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactDetails({ isOpen, onClose }: ContactDetailsProps) {
  const { activeChat } = useChatStore();
  const { deleteChat } = useDeleteChats();
  const { isBlocked, confirmBlock, confirmUnblock, confirmBlockDialog } = useBlockedContacts();
  const { openAddContactDialog, AddContactDialog } = useAddContact();
  const [showAddMembersPopup, setShowAddMembersPopup] = useState(false);
  const [showViewAllMembers, setShowViewAllMembers] = useState(false);

  const router = useRouter();

  const openAddMembers = () => setShowAddMembersPopup(true);
  const closeAddMembers = () => setShowAddMembersPopup(false);
  const existingMemberNumbers = activeChat?.participants.map(m => m.number) ?? [];

  if (!isOpen || !activeChat) return null;

  const formatPhone = (number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  };

  const handleDelete = async () => {
    if (!activeChat) return;
    const success = await deleteChat(activeChat._id!.toString());
    if (success) {
      // onDelete?.(chatId); // ✅ refresh or remove from UI
      router.refresh(); // 🔄 re-fetches data for the current route
    }
  };

  const isBroadcast = activeChat.type === "broadcast";
  const partner = activeChat.participants?.[0];
  const displayName = isBroadcast
    ? activeChat.chatName || "Broadcast"
    : partner?.name || formatPhone(String(partner?.number)) || "Unknown";

  const displayImage = isBroadcast
    ? activeChat.chatImage
    : partner?.imageUrl;

  const phoneNumber = isBroadcast ? "" : partner?.number;

  // ⭐ Determine block/unblock for UI
  const isUserBlocked = partner ? isBlocked(partner) : false;

  return (
    <div className="w-100 bg-white dark:bg-[#161717] border-l flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex items-center">
        <IconButton
          onClick={onClose}
          label="close"
          IconSrc="/assets/icons/close.svg"
        />

        <h2 className="text-base font-semibold pl-2 flex-1">
          Contact Info
        </h2>

        {/* Show only when name is undefined OR empty */}
        {!activeChat?.participants?.[0]?.name && (
          <IconButton
            onClick={() =>
              openAddContactDialog({
                name: "",
                phones: [
                  { number: activeChat?.participants?.[0]?.number || "" },
                ],
              })
            }
            label="Add contact"
            IconSrc="/assets/icons/add-contacts.svg"
            className="ml-auto"
          />
        )}

        {AddContactDialog}
      </div>

      {/* Contact Info */}
      <div className="flex-1 overflow-y-auto">
        {/* Avatar and Name */}
        <div className="p-6 flex flex-col items-center text-center">
          <div className={`rounded-full flex items-center justify-center bg-gray-200 dark:bg-[#242626] overflow-hidden
            ${
              displayImage ?  "" : "border soldid white"
            }
          `}>
            {displayImage ? (
              <img
                src={displayImage}
                alt={activeChat.chatImage || "Unknown"}
                className={`h-25 w-25 rounded-full object-cover`}
              />
            ) : (
              isBroadcast 
                ? <img src={"/assets/icons/users.svg"} className="w-25 h-25 dark:invert opacity-40" alt={"users"} />
                : <img src={"/assets/icons/user.svg"} className="w-25 h-25 dark:invert opacity-40" alt={"user"} />
            )}
          </div>

          <h3 className="text-xl font-semibold mt-4">{displayName}</h3>
          {phoneNumber && (
            <p className="text-gray-500 text-sm mt-1">
              {formatPhone(phoneNumber)}
            </p>
          )}
        </div>

        {/* About Section */}
        <div className="p-4 mt-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">About</h4>
          <p className="text-sm">
            {"Hey there! I am using WhatsApp."}
            {/* {partner?.about || "Hey there! I am using WhatsApp."} */}
          </p>
        </div>

        {/* Media, Links and Docs */}
        <div className="p-4 border-t">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Media, links and docs
          </h4>
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="aspect-square bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center"
              >
                <span className="text-xs text-gray-500">Media {item}</span>
              </div>
            ))}
          </div>
          <Button variant="link" className="p-0 h-auto text-blue-600 mt-2">
            View all
          </Button>
        </div>

        {/* Members Section */}
        {isBroadcast && (
          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-500">
                {activeChat.participants.length} Members
              </h4>
            </div>

            <div className="space-y-3">
              <ContactAvatar
                onClick={openAddMembers}
                // imageUrl={memberImage}
                title="Add memeber"
                size="md"
              />
              {activeChat.participants?.slice(0, 3).map((member, index) => {
                const memberName = member.name || formatPhone(String(member?.number)) || "Unknown";
                const memberImage = member.imageUrl;
                const memberSubtitle = member.number;
                return (
                  <div key={member.number || index} className="flex items-center gap-3">
                    <ContactAvatar
                      imageUrl={memberImage}
                      title={memberName}
                      subtitle={memberSubtitle}
                      size="md"
                      rightMenu={
                        <MembersMenu 
                          member={member} 
                          // onRemove={handleDelete}
                        />}
                    />
                  </div>
                );
              })}

              {activeChat.participants.length > 3 && (
                <div className="flex justify-center mt-2">
                  <button
                    className="text-2sm text-[#21C063] hover:underline"
                    onClick={() => setShowViewAllMembers(true)}
                  >
                    View All ({activeChat.participants.length})
                  </button>
                </div>
              )}
              
              <AddContactsToBroadcastPopup
                isOpen={showAddMembersPopup}
                onClose={closeAddMembers}
                existingMembers={existingMemberNumbers}
              />
              <ViewAllMembersPopup
                isOpen={showViewAllMembers}
                onClose={() => setShowViewAllMembers(false)}
                members={activeChat.participants}
                formatPhone={formatPhone}
              />
            </div>
          </div>
        )}

        {/* Additional Features */}
        <div className="p-4 border-t space-y-2">
          <Button variant="ghost" className="w-full justify-start text-gray-700 dark:text-gray-300">
            <Star className="h-4 w-4 mr-3" />
            Starred Messages
          </Button>
          {/* ⭐ Dynamic Block / Unblock Feature */}
          {!isBroadcast && partner && (
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isUserBlocked ? "" : "text-red-600"
              }`}
              onClick={() =>
                isUserBlocked
                  ? confirmUnblock(partner)
                  : confirmBlock(partner)
              }
            >
              {isUserBlocked ? (
                <>
                  <Ban className="h-4 w-4 mr-3" />
                  Unblock Contact
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-3" />
                  Block Contact
                </>
              )}
            </Button>
          )}
          <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-3" />
            Delete Chat
          </Button>
        </div>
      </div>
      {confirmBlockDialog()}
    </div>
  );
}