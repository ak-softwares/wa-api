'use client';

import { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "@/components/ui/sonner";

export interface ImportedContact {
  id: string;
  name: string;
  phones: string[];
  email?: string;
  tags?: string[];
  status: "valid" | "invalid" | "duplicate";
  errors?: string[];
}

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
        const tags = ["Excel Import"];

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
          tags,
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

  // -----------------------------------------
  // 2. UPLOAD SELECTED CONTACTS (Manual Trigger)
  // -----------------------------------------
  const uploadSelectedContacts = async (selectedIds: string[]) => {
    const validSelected = importedContacts.filter(
        (c) => selectedIds.includes(c.id) && c.status === "valid"
    );

    if (validSelected.length === 0) {
        toast.error("No valid contacts selected");
        return false;
    }

    try {
        setIsImporting(true);

        const res = await fetch("/api/wa-accounts/contacts/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contacts: validSelected }),
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.message || "Failed to upload contacts");
            return false;
        }

        const uploaded = data.data?.uploadedCount || 0;
        const skipped = data.data?.skippedCount || 0;

        // --- Toast Messages ---
        if (uploaded > 0) {
            toast.success(`Uploaded ${uploaded} contacts`);
        }

        if (skipped > 0) {
            toast.warning(`${skipped} contacts were skipped (invalid or missing fields)`);
        }

        return true;

    } catch (err: any) {
        console.error(err);
        toast.error("Failed to upload contacts");
        return false;

    } finally {
        setIsImporting(false);
    }
  };


  const validContacts = importedContacts.filter((c) => c.status === "valid");
  const invalidContacts = importedContacts.filter((c) => c.status !== "valid");

  return {
    isImporting,
    importProgress,
    importedContacts,
    validContacts,
    invalidContacts,
    parseFile,
    uploadSelectedContacts,
  };
}
