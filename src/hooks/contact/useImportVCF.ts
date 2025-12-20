"use client";

import { useState } from "react";
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

export function useVCFImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importedContacts, setImportedContacts] = useState<ImportedContact[]>([]);

  // --------------------------------------------------
  // PARSE VCF FILE (.vcf)
  // --------------------------------------------------
  const parseVCF = async (file: File) => {
    try {
      setIsImporting(true);
      setImportProgress(10);

      const text = await file.text();
      const blocks = text
        .split("BEGIN:VCARD")
        .filter((b) => b.includes("END:VCARD"))
        .map((b) => "BEGIN:VCARD" + b);

      const seenPhones = new Set<string>();
      const parsed: ImportedContact[] = [];

      blocks.forEach((block, index) => {
        const lines = block
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        let name = "";
        let email = "";
        const phones: string[] = [];
        const tags = ["VCF Import"];

        lines.forEach((line) => {
          if (line.startsWith("FN:") || line.startsWith("NAME:")) {
            name = line.split(":")[1]?.trim() || "";
          }

          if (line.startsWith("EMAIL")) {
            email = line.split(":")[1]?.trim() || "";
          }

          if (line.startsWith("TEL")) {
            const phone = line.split(":")[1]?.replace(/\D/g, "") || "";
            if (phone.length > 0) phones.push(phone);
          }
        });

        const errors: string[] = [];
        let status: "valid" | "invalid" | "duplicate" = "valid";

        if (!name) {
          errors.push("Name missing");
          status = "invalid";
        }

        if (phones.length === 0) {
          errors.push("Phone missing");
          status = "invalid";
        } else {
          const uniquePhones: string[] = [];

          phones.forEach((p) => {
            if (p.length < 7) {
              errors.push(`Invalid phone: ${p}`);
              status = "invalid";
            } else if (seenPhones.has(p)) {
              errors.push(`Duplicate phone: ${p}`);
              status = "duplicate";
            } else {
              uniquePhones.push(p);
              seenPhones.add(p);
            }
          });

          phones.splice(0, phones.length, ...uniquePhones);
        }

        parsed.push({
          id: (index + 1).toString(),
          name,
          email,
          phones,
          tags,
          status,
          errors: errors.length ? errors : undefined,
        });
      });

      setImportProgress(90);
      setImportedContacts(parsed);
      toast.success(`Processed ${parsed.length} VCF contacts`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse VCF");
    } finally {
      setIsImporting(false);
      setImportProgress(100);
      setTimeout(() => setImportProgress(0), 800);
    }
  };

  // --------------------------------------------------
  // UPLOAD (same as CSV/Excel)
  // --------------------------------------------------
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

      const res = await fetch("/api/whatsapp/contacts/import", {
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

      if (uploaded > 0) toast.success(`Uploaded ${uploaded} contacts`);
      if (skipped > 0) toast.warning(`${skipped} skipped`);

      return true;
    } catch {
      toast.error("Failed to upload contacts");
      return false;
    } finally {
      setIsImporting(false);
    }
  };

  const validContacts = importedContacts.filter((c) => c.status === "valid");
  const invalidContacts = importedContacts.filter((c) => c.status !== "valid");

  return {
    parseVCF,
    uploadSelectedContacts,
    importedContacts,
    validContacts,
    invalidContacts,
    isImporting,
    importProgress,
  };
}
