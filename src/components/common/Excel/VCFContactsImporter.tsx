"use client";

import { useRef, useState, useMemo } from "react";
import { AlertCircle, Upload } from "lucide-react";

import SearchBar from "@/components/common/SearchBar";
import ContactAvatar from "@/components/dashboard/contacts/common/ContactAvatar";
import { toast } from "@/components/ui/sonner";

import IconButton from "@/components/common/IconButton";
import IconButtonSend from "@/components/common/IconButtonSend";
import GenericMenu from "@/components/common/DropDownMenu";

import { ImportedContact } from "@/types/Contact";
import { useVCFImport } from "@/hooks/contact/useImportVCF";

type Props = {
  onBack?: () => void;
  onImportContacts: (contacts: ImportedContact[]) => void;
};

export default function VCFContactsImporter({ onBack, onImportContacts }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    parseVCF,
    importedContacts,
    validContacts,
    invalidContacts,
    isImporting,
    importProgress,
  } = useVCFImport();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // FILTER
  const filteredContacts = useMemo(() => {
    return importedContacts.filter((c: any) => {
      if (!searchTerm.trim()) return true;

      return (
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phones?.some((p: string) => p.includes(searchTerm)) ||
        c.tags?.some((t: string) =>
          t.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [importedContacts, searchTerm]);

  // FILE HANDLING
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

  // SELECTION
  const toggleContactSelection = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllValid = () => {
    setSelectedContacts(validContacts.map((c: any) => c.id));
  };

  const clearSelection = () => setSelectedContacts([]);

  const filterByTag = (tag: string) => {
    setSearchTerm(tag);
  };

  // IMPORT
  const handleImportSelected = () => {
    if (selectedContacts.length === 0) {
      toast.error("Please select at least one contact");
      return;
    }

    const selected = validContacts.filter((c: any) =>
      selectedContacts.includes(c.id)
    );

    onImportContacts(selected);
  };

  const topItems = [
    {
      icon: "/assets/icons/select.svg",
      label: "Select All Valid",
      action: selectAllValid,
    },
    { icon: "/assets/icons/close.svg", label: "Clear All", action: clearSelection },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* BODY */}
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
              <p className="text-gray-500 mb-6">
                Drag & drop or click to browse.
              </p>

              <div className="w-full flex flex-col items-center justify-center">
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
                      Choose File
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
          // PREVIEW LIST
          <div className="flex flex-col h-full">
            {/* TOP BAR */}
            <div>
              <div className="px-4 py-2 mb-2 flex items-center justify-between bg-gray-100 dark:bg-[#1E1F1F] border-b border-t border-gray-300 dark:border-[#333434]">
                <div className="flex items-center gap-3">
                  <IconButton
                    onClick={onBack ? onBack : clearSelection}
                    label={"Close Selection"}
                    IconSrc={"/assets/icons/close.svg"}
                  />
                  <h2 className="text-lg">{selectedContacts.length} selected</h2>
                </div>

                <GenericMenu topItems={topItems} />
              </div>
            </div>

            {/* SEARCH */}
            <div className="p-4">
              <SearchBar
                value={searchTerm}
                placeholder="Search imported contacts..."
                onSearch={setSearchTerm}
              />
            </div>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto pb-5 px-3">
              {filteredContacts.map((c: any) => {
                const isSelected = selectedContacts.includes(c.id);
                const isInvalid = c.status !== "valid";

                return (
                  <div
                    key={c.id}
                    onClick={() => !isInvalid && toggleContactSelection(c.id)}
                  >
                    <ContactAvatar
                      title={c.name}
                      subtitle={c.phones?.join(", ")}
                      tags={c.tags}
                      onTagClick={(tag) => filterByTag(tag)}
                      size="xl"
                      isSelectionMode={!isInvalid}
                      isSelected={isSelected}
                      isDisabled={isInvalid}
                      rightMenu={
                        isInvalid && (
                          <div className="flex items-center gap-2 text-amber-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">
                              {c.errors?.join(", ")}
                            </span>
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

      {/* FOOTER */}
      {selectedContacts.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t dark:border-[#333434]">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {selectedContacts.length} contact
            {selectedContacts.length > 1 ? "s" : ""} selected
          </p>

          <IconButtonSend
            IconSrc={"/assets/icons/send-message.svg"}
            onClick={handleImportSelected}
            label={"Import"}
            className="bg-[#21C063] !hove:bg-[#21C063] text-white"
          >
            Send
          </IconButtonSend>
        </div>
      )}
    </div>
  );
}
