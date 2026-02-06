"use client";

import { useEffect, useRef, useState } from "react";
import { Template } from "@/types/Template";
import { ChevronDown, Search, Check, FileText, Tag, Globe } from "lucide-react";
import SearchBar from "@/components/common/SearchBar";
import { TemplateTile } from "../TemplateTile";
import { Skeleton } from "@/components/ui/skeleton";
import { useTemplates } from "@/hooks/template/useTemplate";

interface TemplateSearchSelectProps {
  selectedTemplate?: Template;
  onChange: (template: Template | null) => void;
  placeholder?: string;
}

export default function TemplateSearchSelect({
  selectedTemplate,
  onChange,
  placeholder = "Select a template",
}: TemplateSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const { templates, loading, searchTemplates, hasMore, loadingMore } = useTemplates({ sidebarRef, isSend: true });
  

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Clear search when closing
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Selected Template Display */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          w-full min-w-0 px-4 py-3 rounded-full
          bg-gray-50 dark:bg-[#2A2B2B]
          transition-all duration-200
          flex items-center justify-between
          text-left
          group
          focus:outline-none focus:ring-2 focus:ring-white
        "
      >
        <div className="flex items-center gap-3 min-w-0">
          {selectedTemplate ? (
            <>
              <div className="min-w-0 flex items-center gap-2 min-w-0">
                <p className="font-medium truncate flex-1">
                  {selectedTemplate.name}
                </p>

                <span className="text-xs text-gray-600 dark:text-gray-400 shrink-0">
                  ({selectedTemplate.category})
                </span>
              </div>
            </>
          ) : (
            <>
              <span className="text-gray-500 dark:text-gray-400">
                {placeholder}
              </span>
            </>
          )}
        </div>
        
        <ChevronDown className={`
          w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0
          ${open ? "rotate-180" : ""}
          group-hover:text-gray-600 dark:group-hover:text-gray-300
        `} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="
          absolute z-50 mt-2 w-full
          rounded-xl
          bg-white dark:bg-[#2A2B2B]
          overflow-hidden
          animate-in fade-in slide-in-from-top-2 duration-200
        ">
          {/* Header */}
          <div className="py-2">
              {/* Search Bar */}
              <SearchBar
                  placeholder="Search templates..."
                  onSearch={searchTemplates}
              />

          </div>

          {/* Template List */}
          <div ref={sidebarRef} className="max-h-72 overflow-y-auto">
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
              <div className="p-6 text-center">
                <div className="inline-flex p-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No templates found
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Try a different search term
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {templates.map((template) => (
                  <TemplateTile
                    key={template.id}
                    isSearchSelect={true} // NEW
                    isActive={selectedTemplate && selectedTemplate.name === template.name}
                    template={template}
                    onClick={() => {
                      onChange(template);
                      setOpen(false);
                    }}
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

          {/* Footer */}
          <div className="
            p-3 border-t border-gray-100 dark:border-gray-800
            bg-gray-50/50 dark:bg-[#2E2F2F]/50
          ">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#00a884]" />
                  Selected template
                </span>
                <span>{templates.length} total templates</span>
              </div>
              <button
                onClick={() => {
                  onChange(null);
                  handleClose();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Clear selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}