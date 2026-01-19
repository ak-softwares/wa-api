'use client';

import { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "@/components/ui/sonner";
import { ImportedContact } from "@/types/Contact";

export function useExcelImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importedContacts, setImportedContacts] = useState<ImportedContact[]>([]);

  // -----------------------------------------
  // 1. PARSE FILE (Excel / CSV)
  // -----------------------------------------
  const parseFile = async (file: File) => {
    try {
      setIsImporting(true);
      setImportProgress(10);

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      setImportProgress(40);

      const seenPhones = new Set<string>();
      const parsed: ImportedContact[] = [];

      rows.forEach((row, index) => {
        const name = row.Name?.toString().trim();
        const email = row.Email?.toString().trim();
        const phoneRaw = row.Phones?.toString().trim();
        // ✅ Tags column (comma separated)
        const fileTags = row.Tags?.toString().trim();
        const tags = [
          "Excel Import",
          ...(fileTags
            ? fileTags
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean)
            : []),
        ];
        // ✅ Remove duplicates
        const uniqueTags = Array.from(new Set(tags));

        const errors: string[] = [];
        let status: "valid" | "invalid" | "duplicate" = "valid";
        const phones: string[] = [];

        // Validation
        if (!name) {
          status = "invalid";
          errors.push("Name missing");
        }

        if (!phoneRaw) {
          status = "invalid";
          errors.push("Phone missing");
        } else {
          const phoneList = phoneRaw.split(" ").map((p: string) => p.trim());
          phoneList.forEach((p: string) => {
            if (p.length < 7) {
              status = "invalid";
              errors.push(`Invalid phone: ${p}`);
            } else if (seenPhones.has(p)) {
              status = "duplicate";
              errors.push(`Duplicate phone: ${p}`);
            } else {
              phones.push(p);
              seenPhones.add(p);
            }
          });
        }

        parsed.push({
          id: (index + 1).toString(),
          name,
          email,
          phones,
          status,
          tags: uniqueTags,
          errors: errors.length > 0 ? errors : undefined,
        });
      });

      setImportProgress(90);
      setImportedContacts(parsed);
      toast.success(`Processed ${parsed.length} contacts`);

    } catch (err) {
      toast.error("Failed to parse file");
    } finally {
      setIsImporting(false);
      setImportProgress(100);
      setTimeout(() => setImportProgress(0), 800);
    }
  };

  // -------------------------------------------------------
  // DOWNLOAD TEMPLATE
  // -------------------------------------------------------
  const downloadTemplate = () => {
    const template = [
      ["Name", "Phones", "Tags", "Email"],
      ["John Doe", "919876543210", "Remarketing", "john@example.com" ],
      ["Jane Smith", "919876543211", "Loyal customers", "jane@example.com"],
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts_template.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const validContacts = importedContacts.filter((c) => c.status === "valid");
  const invalidContacts = importedContacts.filter((c) => c.status !== "valid");

  return {
    parseFile,
    isImporting,
    importProgress,
    importedContacts,
    validContacts,
    invalidContacts,
    downloadTemplate,
  };
}
