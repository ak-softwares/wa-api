// hooks/useDeleteContacts.ts
"use client";
import { useState } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "sonner";

export function useDeleteContacts(onContactDeleted?: () => void) {
  const [deleting, setDeleting] = useState(false);

  const deleteContact = async (contactId: string, contactName?: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });

      const json: ApiResponse = await res.json();

      if (json.success) {
        toast.success(`Contact "${contactName}" deleted successfully`);
        onContactDeleted?.();
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

  return { deleteContact, deleting };
}
