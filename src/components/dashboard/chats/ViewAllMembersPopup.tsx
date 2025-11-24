'use client';

import { useMemo, useState } from "react";
import IconButton from "@/components/common/IconButton";
import ContactAvatar from "../contacts/ContactAvatar";
import SearchBar from "@/components/common/SearchBar";
import MembersMenu from "./MembersMenu";

interface ViewAllMembersPopupProps {
  isOpen: boolean;
  onClose: () => void;
  members: {
    name?: string;
    number: string;
    imageUrl?: string;
  }[];
  formatPhone: (num: string) => string;
}

export default function ViewAllMembersPopup({
  isOpen,
  onClose,
  members,
  formatPhone
}: ViewAllMembersPopupProps) {

  // ❗ Hooks MUST be at top (always executed)
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    if (!q) return members;

    return members.filter(m =>
      (m.name?.toLowerCase().includes(q)) ||
      m.number.includes(q) ||
      formatPhone(m.number).toLowerCase().includes(q)
    );
  }, [members, searchQuery, formatPhone]);


  // ❗ Return after hooks
  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#161717] rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">

        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-4">
            <IconButton
              onClick={onClose}
              label="Back"
              IconSrc="/assets/icons/close.svg"
            />
            <h3 className="text-lg font-semibold">Broadcast Members</h3>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
          placeholder="Search members..."
          onSearch={setSearchQuery}
        />

        {/* Members */}
        <div className="flex-1 overflow-y-auto p-3">
          {filteredMembers.map((member, i) => {
            const memberName = member.name || formatPhone(member.number) || "Unknown";
            return (
              <div key={i} className="mb-3">
                <ContactAvatar
                  imageUrl={member.imageUrl}
                  title={memberName}
                  subtitle={member.number}
                  size="xl"
                  rightMenu={
                    <MembersMenu
                      member={member} 
                      // onRemove={handleDelete}
                    />}
                />
              </div>
            );
          })}

          {/* Empty state */}
          {filteredMembers.length === 0 && (
            <p className="text-center text-sm text-gray-500 mt-4">
              No members found
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
