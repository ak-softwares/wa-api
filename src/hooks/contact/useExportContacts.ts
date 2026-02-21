import { showToast } from "@/components/ui/sonner";
import { Contact } from "@/types/Contact";
import * as XLSX from "xlsx";

export const useExportContacts = () => {
  const exportContacts = (selectedContacts: Contact[]) => {
    if (!selectedContacts || selectedContacts.length === 0) {
      showToast.error("No contacts selected for export");
      return;
    }

    try {
      // Format contacts: only name, email, phones, tags
      const formattedContacts = selectedContacts.map((c) => ({
        Name: c.name || "",
        Email: c.email || "",
        Phones: c.phones?.join(", ") || "",
        Tags: c.tags?.join(", ") || "",
      }));

      // Convert formatted contacts to worksheet
      const worksheet = XLSX.utils.json_to_sheet(formattedContacts);

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");

      // Download file
      XLSX.writeFile(workbook, "contacts_export.xlsx");

      showToast.success("Contacts exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      showToast.error("Failed to export contacts");
    }
  };

  return { exportContacts };
};
