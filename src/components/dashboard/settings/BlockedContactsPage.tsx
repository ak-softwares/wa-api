"use client";

import IconButton from "@/components/common/IconButton";
import { useBlockedContacts } from "@/hooks/chat/useBlockedContacts";
import { useSettingsStore } from "@/store/settingsStore";
import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js";
import ContactAvatar from "../contacts/common/ContactAvatar";
import { Skeleton } from "@/components/ui/skeleton"; // <-- Make sure this exists
import BlockContactsPopup from "./BlockContactsPopup";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";

export default function BlockedContactsPage() {
    const { blockedList, confirmBlock, confirmUnblock, confirmBlockDialog, loading, blockNumber } = useBlockedContacts();
    // const { blockContactList } = useBlockedContacts();
    const { setSelectedSettingsMenu } = useSettingsStore();
    const [isBlockOpen, setIsBlockOpen] = useState(false);
    const formatPhone = ( number: string, defaultCountry: CountryCode = "IN") => {
        const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
        return phoneNumber ? phoneNumber.formatInternational() : number;
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <IconButton
                        label="Back"
                        IconSrc="/assets/icons/arrow-left.svg"
                        onClick={() => setSelectedSettingsMenu(null)}
                    />
                    <h1 className="text-xl font-semibold">Blocked Contacts</h1>
                </div>
            </div>

            {/* Add Blocked Contact */}
            {!loading && (
                <div className="mx-3">
                    <ContactAvatar
                        title={"Add blocked contact"}
                        size="xl"
                        onClick={() => setIsBlockOpen(true)}
                    />
                </div>
            )}

            {/* Loading skeleton shimmer */}
            {loading ? (
                <ul className="flex-1 overflow-y-auto p-3 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center p-4 mx-1 mb-1">
                            <Skeleton className="w-12 h-12 rounded-full mr-3" />
                            <div className="flex-1 min-w-0 space-y-2">
                                <Skeleton className="h-5 w-32 rounded" />
                                <Skeleton className="h-4 w-48 rounded" />
                            </div>
                            <Skeleton className="h-4 w-10 ml-2 rounded" />
                        </div>
                    ))}
                </ul>
            ) : blockedList.length === 0 ? (
                <p className="text-gray-500 px-8 py-3">No blocked contacts</p>
            ) : (
                <ul className="flex-1 overflow-y-auto space-y-3 p-3">
                    {blockedList.map((participant) => (
                        <div
                            key={participant.number}
                            className=""
                        >
                            <ContactAvatar
                                title={participant.name || formatPhone(participant.number) || "Unknown"}
                                subtitle={formatPhone(participant.number)}
                                imageUrl={participant.imageUrl}
                                size="xl"
                                rightMenu={
                                    <IconButton
                                        onClick={() => confirmUnblock(participant)}
                                        label={"Remove number"}
                                        IconSrc={"/assets/icons/close.svg"}
                                    />
                                }
                            />
                        </div>
                    ))}
                </ul>
            )}

            <div className="p-6">
                <p className="text-gray-500 text-sm">
                    Once you block this contact, they will no longer be able to send
                    messages to your WhatsApp API number.
                </p>
            </div>
            {confirmBlockDialog()}
            <BlockContactsPopup
                isOpen={isBlockOpen}
                onClose={() => setIsBlockOpen(false)}
                blockedNumbers={blockedList}   // ⬅️ NEW
                onBlock={async (selectedContacts) => {

                    // STEP 1: Convert all Contact → ChatParticipant
                    const participants = selectedContacts.map((contact) => ({
                        name: contact.name ?? "",
                        imageUrl: contact.imageUrl ?? "",
                        number: contact.phones?.[0] || "", // first phone number
                    }));

                    // STEP 2: Block all participants in parallel
                    await Promise.all(
                    participants.map((p) => blockNumber(p))
                    );
                }}
            />
        </div>
    );
}
