"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Upload } from "lucide-react";

import IconButton from "@/components/common/IconButton";
import SearchBar from "@/components/common/SearchBar";
import ContactAvatar from "@/components/dashboard/contacts/ContactAvatar";
import { useContactStore } from "@/store/contactStore";

import { useVCFImport } from "./useImportVCF"; // renamed hook
import { toast } from "@/components/ui/sonner";

export default function VCFImportContactsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    parseVCF,
    uploadSelectedContacts,
    importedContacts,
    validContacts,
    invalidContacts,
    isImporting,
    importProgress,
  } = useVCFImport();

  const { setSelectedContactMenu } = useContactStore();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = importedContacts.filter((c) => {
    if (!searchTerm.trim()) return true;
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phones.some((p) => p.includes(searchTerm))
    );
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseVCF(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseVCF(file);
  };

  const toggleContactSelection = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllValid = () => {
    setSelectedContacts(validContacts.map((c) => c.id));
  };

  const clearSelection = () => setSelectedContacts([]);

  const handleUpload = async () => {
    if (selectedContacts.length === 0) {
      toast.error("Please select at least one contact");
      return;
    }

    const ok = await uploadSelectedContacts(selectedContacts);
    if (ok) router.refresh();
    setSelectedContactMenu(null);
  };

  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={() => setSelectedContactMenu(null)}
            label="Back"
            IconSrc="/assets/icons/arrow-left.svg"
          />
          <h1 className="text-xl font-semibold">Import Contacts from VCF</h1>
        </div>

        {importedContacts.length > 0 && (
          <div className="flex items-center gap-2">

            <button
              onClick={handleUpload}
              disabled={selectedContacts.length === 0 || isImporting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Import Selected ({selectedContacts.length})
                </>
              )}
            </button>

          </div>
        )}
      </div>

      {/* MAIN */}
      <div className="flex-1 overflow-y-auto">

        {importedContacts.length === 0 ? (
          // DROPZONE
          <div className="flex flex-col items-center justify-center p-8 h-full">
            <div
              className={`w-full max-w-2xl border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                isDragging
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 hover:border-green-500"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />

              <h2 className="text-2xl font-semibold mb-2">Upload VCF File</h2>
              <p className="text-gray-500 mb-6">Drag & drop or click to browse.</p>

              <div className="w-full flex flex-col items-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Choose VCF File
                    </>
                  )}
                </button>

                {isImporting && (
                  <div className="mt-4 w-full max-w-xs mx-auto">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        style={{ width: `${importProgress}%` }}
                        className="bg-green-600 h-2 rounded-full transition-all"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Processing file... {importProgress}%
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".vcf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        ) : (
          // CONTACT LIST
          <div className="flex flex-col h-full">
            <div className="p-4 bg-gray-50 flex items-center justify-between border-b">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{validContacts.length} valid</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">{invalidContacts.length} issues</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={selectAllValid} className="text-sm text-green-600">
                  Select All Valid
                </button>
                <span className="text-gray-400">|</span>
                <button onClick={clearSelection} className="text-sm text-gray-500">
                  Clear Selection
                </button>
              </div>
            </div>

            <div className="p-4">
              <SearchBar placeholder="Search imported contacts..." onSearch={setSearchTerm} />
            </div>

            <div className="flex-1 overflow-y-auto pb-5 px-3">
              {filteredContacts.map((c) => {
                const isSelected = selectedContacts.includes(c.id);
                const isInvalid = c.status !== "valid";

                return (
                  <div key={c.id} onClick={() => !isInvalid && toggleContactSelection(c.id)}>
                    <ContactAvatar
                      title={c.name}
                      subtitle={c.phones.join(", ")}
                      size="xl"
                      isSelectionMode={!isInvalid}
                      isSelected={isSelected}
                      isDisabled={isInvalid}
                      rightMenu={
                        isInvalid && (
                          <div className="flex items-center gap-2 text-amber-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{c.errors?.join(", ")}</span>
                          </div>
                        )
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
