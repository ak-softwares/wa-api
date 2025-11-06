'use client';

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, Download, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import IconButton from "@/components/common/IconButton";
import SearchBar from "@/components/common/SearchBar";
import ContactAvatar from "@/components/dashboard/contacts/ContactAvatar";

interface ImportedContact {
  id: string;
  name: string;
  phones: string[];
  email?: string;
  status: 'valid' | 'invalid' | 'duplicate';
  errors?: string[];
}

export default function ImportContactsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importedContacts, setImportedContacts] = useState<ImportedContact[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState(0);

  // Filter contacts based on search
  const filteredContacts = importedContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phones.some(phone => phone.includes(searchTerm))
  );

  const validContacts = filteredContacts.filter(contact => contact.status === 'valid');
  const invalidContacts = filteredContacts.filter(contact => contact.status !== 'valid');

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
      toast.error("Please select a valid Excel or CSV file");
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      // Simulate file processing
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Mock data - replace with actual Excel parsing
      const mockContacts: ImportedContact[] = [
        {
          id: '1',
          name: 'John Doe',
          phones: ['+1234567890'],
          email: 'john@example.com',
          status: 'valid'
        },
        {
          id: '2',
          name: 'Jane Smith',
          phones: ['+0987654321'],
          status: 'valid'
        },
        {
          id: '3',
          name: 'Invalid Contact',
          phones: ['123'], // Invalid phone
          status: 'invalid',
          errors: ['Invalid phone number format']
        },
        {
          id: '4',
          name: 'Duplicate',
          phones: ['+1234567890'],
          status: 'duplicate',
          errors: ['Duplicate phone number']
        }
      ];

      setImportedContacts(mockContacts);
      toast.success(`Found ${mockContacts.length} contacts`);
    } catch (error) {
      toast.error("Failed to process file. Please try again.");
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Toggle contact selection
  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Select all valid contacts
  const selectAllValid = () => {
    setSelectedContacts(validContacts.map(contact => contact.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedContacts([]);
  };

  // Save selected contacts
  const saveSelectedContacts = async () => {
    if (selectedContacts.length === 0) {
      toast.error("Please select at least one contact to import");
      return;
    }

    setIsImporting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Successfully imported ${selectedContacts.length} contacts`);
      router.push("/dashboard/contacts");
    } catch (error) {
      toast.error("Failed to import contacts");
    } finally {
      setIsImporting(false);
    }
  };

  // Download template
  const downloadTemplate = () => {
    // Create and download template file
    const templateData = [
      ['Name', 'Phone', 'Email'],
      ['John Doe', '1234567890', 'john@example.com'],
      ['Jane Smith', '919876543212', 'jane@example.com']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([templateData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={() => router.back()}
            label="Back"
            IconSrc="/assets/icons/arrow-left.svg"
          />
          <div>
            <h1 className="text-xl font-semibold">Import Contacts</h1>
          </div>
        </div>
        
        {importedContacts.length > 0 && (
          <div className="flex items-center gap-2">
            <IconButton
              onClick={downloadTemplate}
              label="Download Template"
              IconSrc="/assets/icons/download.svg"
            />
            <button
              onClick={saveSelectedContacts}
              disabled={selectedContacts.length === 0 || isImporting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {importedContacts.length === 0 ? (
          // Upload Section
          <div className="flex flex-col items-center justify-center p-8 h-full">
            <div
              className={`w-full max-w-2xl border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                isDragging 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-300 dark:border-[#333434] hover:border-green-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              
              <h2 className="text-2xl font-semibold mb-2">Upload Excel or CSV File</h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Drag and drop your contacts file here, or click to browse. Supported formats: .xlsx, .xls, .csv
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
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
                  <div className="w-full bg-gray-200 dark:bg-[#333434] rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Processing file... {importProgress}%</p>
                </div>
              )}

              <div className="mt-8">
                <button
                  onClick={downloadTemplate}
                  className="text-green-600 hover:text-green-700 flex items-center gap-2 mx-auto text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Template File
                </button>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
          </div>
        ) : (
          // Import Preview Section
          <div className="flex flex-col h-full">
            {/* Summary Bar */}
            <div className="p-4 bg-gray-50 dark:bg-[#1E1F1F] border-b border-gray-200 dark:border-[#333434]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{validContacts.length} valid contacts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">{invalidContacts.length} issues found</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAllValid}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Select All Valid
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4">
              <SearchBar
                placeholder="Search imported contacts..."
                onSearch={setSearchTerm}
              />
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map((contact) => {
                const isSelected = selectedContacts.includes(contact.id);
                const isInvalid = contact.status !== 'valid';

                return (
                  <div
                    key={contact.id}
                    className={`mx-3 mb-1 rounded-lg group flex items-center py-4 cursor-pointer transition-colors ${
                      isInvalid 
                        ? 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30' 
                        : 'hover:bg-gray-100 dark:hover:bg-[#2E2F2F]'
                    }`}
                    onClick={() => !isInvalid && toggleContactSelection(contact.id)}
                  >
                    <ContactAvatar
                      title={contact.name || "Unknown"}
                      subtitle={contact.phones.join(', ')}
                      size="xl"
                      isSelectionMode={!isInvalid}
                      isSelected={isSelected}
                      rightMenu={
                        isInvalid && (
                          <div className="flex items-center gap-2 text-amber-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">Issues</span>
                          </div>
                        )
                      }
                    />

                    {/* Error Messages */}
                    {contact.errors && contact.errors.length > 0 && (
                      <div className="ml-4 text-sm text-amber-600">
                        {contact.errors.join(', ')}
                      </div>
                    )}
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