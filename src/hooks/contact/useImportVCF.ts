"use client";

import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { ImportedContact } from "@/types/Contact";

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
        const tags = ["VCF file"];

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

  const validContacts = importedContacts.filter((c) => c.status === "valid");
  const invalidContacts = importedContacts.filter((c) => c.status !== "valid");

  return {
    parseVCF,
    importedContacts,
    validContacts,
    invalidContacts,
    isImporting,
    importProgress,
  };
}
