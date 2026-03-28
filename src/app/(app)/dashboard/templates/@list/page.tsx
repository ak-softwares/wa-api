"use client";

import { useRef, useState } from "react";
import { useTemplates } from "@/hooks/template/useTemplate";
import { Skeleton } from "@/components/ui/skeleton";
import TemplatesMenu from "@/components/dashboard/templates/TemplatesMenu";
import SearchBar from "@/components/common/SearchBar";
import IconButton from "@/components/common/IconButton";
import SelectedTemplatesMenu from "@/components/dashboard/templates/SelectedTemplatesMenu";
import { TemplateTile } from "@/components/dashboard/templates/TemplateTile";
import { Template } from "@/types/Template";
import { useTemplateStore } from "@/store/templateStore";
import { useDeleteTemplates } from "@/hooks/template/useDeleteTemplate";
import { ConfirmDialog } from "@/components/common/dialog/ConfirmDialog";
import { DeleteMode } from "@/utiles/enums/deleteMode";

export default function TemplateListPage() {
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const {
    templates,
    loading,
    refreshTemplates,
    searchTemplates,
    hasMore,
    loadingMore,
  } = useTemplates({ sidebarRef });

  const [selectedTemplates, setSelectedTemplates] = useState<Template[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>(DeleteMode.Single);
  const [targetTemplateName, setTargetTemplateName] = useState<string | null>(null);

  const { setDuplicateTemplateData, setSelectedTemplateMenu, setEditTemplateData } =
    useTemplateStore();

  const { deleteTemplate, deleteTemplatesBulk, isDeleting } =
    useDeleteTemplates(() => {
      refreshTemplates();
      setSelectedTemplates([]);
      setIsSelectionMode(false);
      setOpenDeleteDialog(false);
    });

  // -------------------------
  // Selection helpers
  // -------------------------

  const clearSelection = () => {
    setSelectedTemplates([]);
    setIsSelectionMode(false);
  };

  const selectAllTemplates = () => {
    setSelectedTemplates(templates);
  };

  // -------------------------
  // Delete handlers
  // -------------------------

  const handleDeleteTemplate = (templateName: string) => {
    setDeleteMode(DeleteMode.Single);
    setTargetTemplateName(templateName);
    setOpenDeleteDialog(true);
  };

  const handleBulkDeleteTemplates = () => {
    if (!selectedTemplates.length) return;

    setDeleteMode(DeleteMode.Bulk);
    setOpenDeleteDialog(true);
  };

  // -------------------------
  // Other actions
  // -------------------------

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
        <h1 className="text-xl font-semibold">
          Templates <span className="text-gray-500 text-sm">({templates.length})</span>
        </h1>

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
      )}

      {/* Search */}
      <SearchBar
        placeholder="Search templates..."
        onSearch={searchTemplates}
      />

      {/* Template List */}
      <div ref={sidebarRef} className="flex-1 overflow-y-auto mt-3">
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
          <div className="mx-3">
            {templates.map((template) => (
              <TemplateTile
                key={template.id}
                template={template}
                isSelectionMode={isSelectionMode}
                isSelected={selectedTemplates.some(
                  (t) => t.id === template.id
                )}
                onClick={() => {
                  if (isSelectionMode) {
                    if (selectedTemplates.some((t) => t.id === template.id)) {
                      setSelectedTemplates(
                        selectedTemplates.filter((t) => t.id !== template.id)
                      );
                    } else {
                      setSelectedTemplates([
                        ...selectedTemplates,
                        template,
                      ]);
                    }
                  }else{
                    handleEditTemplate(template);
                  }
                }}
                onDelete={() => handleDeleteTemplate(template.name)}
                onDuplicate={handleDuplicateTemplate}
                onEdit={handleEditTemplate}
              />
            ))}
          </div>
        )}

        {hasMore &&
          loadingMore &&
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center p-4 mx-3 mb-1">
              <Skeleton className="w-12 h-12 rounded-full mr-3" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-4 w-48 rounded" />
              </div>
              <Skeleton className="h-4 w-10 ml-2 rounded" />
            </div>
          ))}
      </div>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={openDeleteDialog}
        loading={isDeleting}
        title={
          deleteMode === DeleteMode.Single
            ? "Delete template?"
            : "Delete selected templates?"
        }
        description="This action cannot be undone."
        onCancel={() => setOpenDeleteDialog(false)}
        onConfirm={async () => {
          if (deleteMode === DeleteMode.Single && targetTemplateName) {
            await deleteTemplate(targetTemplateName);
          }

          if (deleteMode === DeleteMode.Bulk) {
            const names = selectedTemplates.map((t) => t.name);
            await deleteTemplatesBulk(names);
          }
        }}
      />
    </div>
  );
}