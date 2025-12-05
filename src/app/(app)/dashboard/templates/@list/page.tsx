"use client";

import { useState } from "react";
import { useTemplates } from "@/hooks/template/useTemplate";
import { Skeleton } from "@/components/ui/skeleton";
import TemplatesMenu from "@/components/dashboard/templates/TemplatesMenu";
import SearchBar from "@/components/common/SearchBar";
import IconButton from "@/components/common/IconButton";
import SelectedTemplatesMenu from "@/components/dashboard/templates/SelectedTemplatesMenu";
import { TemplateTile } from "@/components/dashboard/templates/TemplateTile";
import { Template } from "@/types/Template";
import { useTemplateStore } from "@/store/templateStore";
import { useDeleteTemplate } from "@/hooks/template/useDeleteTemplate";

export default function TemplateListPage() {
  const { templates, loading, refreshTemplates, searchTemplates } = useTemplates();

  const [selectedTemplates, setSelectedTemplates] = useState<Template[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { setDuplicateTemplateData, setSelectedTemplateMenu, setEditTemplateData } = useTemplateStore();
  // PASS THE REFRESH FUNCTION TO DELETE HOOK
  const { openDeleteDialog, openBulkDeleteDialog, DeleteDialogs } =
    useDeleteTemplate(() => {
      refreshTemplates();   // 🔥 Immediately refresh list after delete
      setSelectedTemplates([]);  // clear selected
      setIsSelectionMode(false); // exit selection mode
    });

  // Clear all selections
  const clearSelection = () => {
    setSelectedTemplates([]);
    setIsSelectionMode(false);
  };

  // Select all Templates
  const selectAllTemplates = () => {
    setSelectedTemplates(templates);
  };

  const handleDeleteTemplate = (templateName: string) => {
    openDeleteDialog(templateName);
  };

  const handleBulkDeleteTemplates = () => {
    const names = selectedTemplates.map(t => t.name);
    openBulkDeleteDialog(names);
  };

  const handleDuplicateTemplate = (template: Template) => {
    setDuplicateTemplateData(template);
    setSelectedTemplateMenu("create-template");
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplateMenu("create-template");
    setEditTemplateData(template);
  };

  return (
    <div className="flex flex-col h-full">
       {/* Header */}
       <div className="p-5 flex items-center justify-between">
         <h1 className="text-xl font-semibold">Templates <span className="text-gray-500 text-sm">({templates.length})</span></h1>
         <div className="flex items-center gap-2">
            <IconButton
              onClick={() => setSelectedTemplateMenu("create-template")}
              label={"Add Template"}
              IconSrc={"/assets/icons/plus-circle.svg"}
            />
            <TemplatesMenu onSelectTemplates={() => setIsSelectionMode(true)} />
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
              <h2 className="text-lg">{selectedTemplates.length} selected</h2>
            </div>
            <SelectedTemplatesMenu
              onSelectAll={selectAllTemplates}
              onDeleteSelected={handleBulkDeleteTemplates}
            />
          </div>
        </div>
      )}

      {/* Search Bar */}
      <SearchBar
          placeholder="Search templates..."
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
              isSelectionMode={isSelectionMode}
              isSelected={selectedTemplates.some(t => t.name === template.name)}
              onClick={() => {
                if (isSelectionMode) {
                  // Toggle selection 
                  if (selectedTemplates.some(t => t.name === template.name)) {
                    setSelectedTemplates(selectedTemplates.filter(t => t.name !== template.name));
                  } else {
                    setSelectedTemplates([...selectedTemplates, template]);
                  }   
                } else {
                  // Handle non-selection mode click if needed
                }
              }}
              onDelete={handleDeleteTemplate}
              onDuplicate={handleDuplicateTemplate}
              onEdit={handleEditTemplate}
            />
          ))
        )}
      </div>
      {DeleteDialogs}
    </div>
  );
}
