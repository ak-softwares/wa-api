// hooks/useDeleteContacts.ts
"use client";
import { useState } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "@/components/ui/sonner";

export function useDeleteContacts(onDeleted?: () => void) {
  const [deleting, setDeleting] = useState(false);

  // ✅ Single Contact Delete
  const deleteContact = async (contactId: string, contactName?: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });

      const json: ApiResponse = await res.json();

      if (json.success) {
        toast.success(`Contact "${contactName || ""}" deleted successfully`);
        onDeleted?.();
        return true;
      } else {
        toast.error(json.message || "Failed to delete contact");
        return false;
      }
    } catch (err) {
      toast.error("Error deleting contact");
      return false;
    } finally {
      setDeleting(false);
    }
  };

  // ✅ Bulk Delete Contacts
  const deleteContactsBulk = async (selectedContacts: string[]) => {
    if (selectedContacts.length === 0) {
      toast.error("No contacts selected");
      return false;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/contacts/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedContacts }),
      });

      const data: ApiResponse = await res.json();

      if (data.success) {
        toast.success("Selected contacts deleted successfully");
        onDeleted?.();
        return true;
      } else {
        toast.error(data.message || "Failed to delete selected contacts");
        return false;
      }
    } catch (err) {
      toast.error("Error deleting selected contacts");
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteContact, deleteContactsBulk, deleting };
}
