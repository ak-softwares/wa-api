"use client";

import { ImportIcon, FileSpreadsheet, Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import IconButton from "@/components/common/IconButton";
import { useGoogleImport } from "@/hooks/contact/useGoogleImport";
import { useRouter } from "next/navigation";

interface ContactsMenuProps {
  onSelectContacts?: () => void; // ✅ Prop for parent callback
}

export default function ContactsMenu({ onSelectContacts }: ContactsMenuProps) {

  const router = useRouter();
  const { handleGoogleImport, loading } = useGoogleImport();

  const goToImportedContacts = () => {
    router.push("/dashboard/contacts/imported-contacts");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            asChild
            label="Contact Menu"
            IconSrc="/assets/icons/more-vertical.svg"
            tooltipSide="bottom"
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
          className="dark:bg-[#161717]"
        >
          
          {/* Edit Placeholder */}
          <DropdownMenuItem
            className="hover:dark:bg-[#343636] flex items-center gap-2"
            onClick={() => onSelectContacts?.()}
          >
            <img
              src={"/assets/icons/select.svg"}
              className="w-6 h-6 dark:invert"
              alt={"more options"}
            />
            Select Contacts
          </DropdownMenuItem>

          {/* Chat Item */}
          <DropdownMenuItem
            className="flex items-center gap-2 hover:dark:bg-[#343636]"
            onClick={() => onSelectContacts?.()}
          >
            <img
              src={"/assets/icons/broadcast.svg"}
              className="w-6 h-6 dark:invert"
              alt={"more options"}
            />
            Broadcast List
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2 hover:dark:bg-[#343636]"
            onClick={handleGoogleImport}
          >
            <Mail size={22} strokeWidth={2.5} />
            Import from Google
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2 hover:dark:bg-[#343636]"
            onClick={goToImportedContacts}
          >
            <FileSpreadsheet size={22} strokeWidth={2.5} />
            Import from Excel
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
