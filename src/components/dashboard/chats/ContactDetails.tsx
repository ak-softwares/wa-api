// components/chat/ContactDetails.tsx
"use client";

import { useChatsContext } from "@/hooks/chat/ChatsContext";
import ContactAvatar from "../contacts/ContactAvatar";
import { Button } from "@/components/ui/button";
import { X, Phone, Video, Star, Ban, Trash2 } from "lucide-react";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

interface ContactDetailsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactDetails({ isOpen, onClose }: ContactDetailsProps) {
  const { activeChat } = useChatsContext();

  if (!isOpen || !activeChat) return null;

  const formatPhone = (number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
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

  return (
    <div className="w-100 bg-white dark:bg-[#161717] border-l flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex items-center">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white dark:hover:bg-[#252727] hover:bg-gray-200"
        >
          <img src="/assets/icons/close.svg" className="w-6 h-6 dark:invert" alt="send" />
        </button>
        <h2 className="text-base font-semibold pl-2">Contact Info</h2>

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

        {/* Additional Features */}
        <div className="p-4 border-t space-y-2">
          <Button variant="ghost" className="w-full justify-start text-gray-700 dark:text-gray-300">
            <Star className="h-4 w-4 mr-3" />
            Starred Messages
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-700 dark:text-gray-300">
            <Ban className="h-4 w-4 mr-3" />
            Block Contact
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-600">
            <Trash2 className="h-4 w-4 mr-3" />
            Delete Chat
          </Button>
        </div>
      </div>
    </div>
  );
}