"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { FileText, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { useTemplates } from "@/hooks/template/useTemplate";
import { Skeleton } from "@/components/ui/skeleton";
import TemplatesMenu from "./TemplatesMenu";
import SearchBar from "@/components/common/SearchBar";
import IconButton from "@/components/common/IconButton";
import SelectedTemplatesMenu from "./SelectedTemplatesMenu";
import { TemplateTile } from "./TemplateTile";

export default function TemplateList() {
  const router = useRouter();
  const { templates, loading, loadingMore, hasMore, refreshTemplates, searchTemplates } = useTemplates();

  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "PENDING":
        return <FileText className="h-4 w-4 text-yellow-500" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "MARKETING":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "UTILITY":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "AUTHENTICATION":
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedTemplateIds([]);
    setIsSelectionMode(false);
  };

  // Select all Templates
  const selectAllTemplates = () => {
    setSelectedTemplateIds(templates.map(template => template._id!.toString()));
  };

  return (
    <div className="flex flex-col h-full">
       {/* Header */}
       <div className="p-5 flex items-center justify-between">
         <h1 className="text-xl font-semibold">Templates <span className="text-gray-500 text-sm">({0})</span></h1>
         <div className="flex items-center gap-2">
            <IconButton
              onClick={() => router.push("/dashboard/templates/create")}
              label={"Add Template"}
              IconSrc={"/assets/icons/plus-circle.svg"}
            />
            <TemplatesMenu onSelectChats={() => setIsSelectionMode(true)} />
         </div>
       </div>

      {/* Selection Mode */}
      {isSelectionMode && (
        <div>
          <div className="px-4 py-2 mb-2 flex items-center justify-between bg-gray-100 dark:bg-[#1E1F1F] border-b border-t border-gray-300 dark:border-[#333434]">
            <div className="flex items-center gap-3">
              <IconButton
                onClick={clearSelection}
                label={"Close Selection"}
                IconSrc={"/assets/icons/close.svg"}
              />
              <h2 className="text-lg">{selectedTemplateIds.length} selected</h2>
            </div>
            <SelectedTemplatesMenu
            //   onDeleteSelected={handleDeleteSelected}
              onSelectAll={selectAllTemplates} 
            />
          </div>
        </div>
      )}

      {/* Search Bar */}
      <SearchBar
          placeholder="Search contacts..."
          onSearch={searchTemplates}
      />

      {/* Template List */}
      <div className="space-y-2 mt-3 mx-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center p-4 mx-3 mb-1">
              <Skeleton className="w-12 h-12 rounded-full mr-3" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-4 w-48 rounded" />
              </div>
              <Skeleton className="h-4 w-10 ml-2 rounded" />
            </div>
          ))
        ) : templates.length === 0 ? (
            <div className="p-8 text-center">No template found.</div>
        ) : (
          templates.map((template) => (
            <TemplateTile
              key={template.id}
              template={template}
              // onDelete={handleDeleteTemplate}
              // onEdit={handleEditTemplate}
              // onClick={() => handleTemplateClick(template.id)}
            />
          ))
        )}

        {hasMore && loadingMore && (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center p-4 mx-3 mb-1">
              <Skeleton className="w-12 h-12 rounded-full mr-3" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-4 w-48 rounded" />
              </div>
              <Skeleton className="h-4 w-10 ml-2 rounded" />
            </div>
          ))
        )}
      </div>

    </div>
  );
}
