"use client";
import { useState } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "@/components/ui/sonner";
import { DeleteMode } from "@/utiles/enums/deleteMode";

export function useDeleteContacts(onDeleted?: (payload: {
    mode: DeleteMode;
    deletedIds: string[];
  }) => void) {

  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ Single Contact Delete
  const deleteContact = async (contactId: string, contactName?: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/wa-accounts/contacts/${contactId}`, {
        method: "DELETE",
      });

      const json: ApiResponse = await res.json();

      if (json.success) {
        toast.success(`Contact "${contactName || ""}" deleted successfully`);
        onDeleted?.({
          mode: DeleteMode.Single,
          deletedIds: [contactId],
        });
      } else {
        toast.error(json.message || "Failed to delete contact");
      }
    } catch (err) {
      toast.error("Error deleting contact");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Bulk Delete Contacts
  const deleteContactsBulk = async (contactIds: string[]) => {
    if (contactIds.length === 0) {
      toast.error("No contacts selected");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/wa-accounts/contacts/bulk-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: contactIds }),
      });

      const data: ApiResponse = await res.json();

      if (data.success) {
        toast.success("Selected contacts deleted successfully");
        onDeleted?.({
          mode: DeleteMode.Bulk,
          deletedIds: contactIds,
        });
      } else {
        toast.error(data.message || "Failed to delete selected contacts");
      }
    } catch (err) {
      toast.error("Error deleting selected contacts");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Delete All Contacts
  const deleteAllContacts = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/wa-accounts/contacts`, {
        method: "DELETE",
        headers: {
          "x-confirm-delete-all": "true", // 🔐 optional safety
        },
      });

      const json: ApiResponse = await res.json();

      if (json.success) {
        const count = json.data?.deletedCount ?? 0;
        toast.success(
          count > 0
            ? `${count} contacts deleted successfully`
            : "No contacts to delete"
        );
        onDeleted?.({
          mode: DeleteMode.All,
          deletedIds: [],
        });
      } else {
        toast.error(json.message || "Failed to delete contact");
      }
    } catch (err) {
      toast.error("Error deleting contact");
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteContact, deleteContactsBulk, deleteAllContacts, isDeleting };
}
