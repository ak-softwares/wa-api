"use client";

import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Search, Plus, FileText, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { useTemplates } from "@/hooks/template/useTemplate";
import { useDebounce } from "@/hooks/common/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteTemplateDialog from "@/components/dashboard/templates/DeleteTemplateDialog";

export default function TemplateManagementPage() {
  const router = useRouter();
  const { templates, loading, loadingMore, hasMore, refreshTemplates, searchTemplates } = useTemplates();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleSearch = useCallback(async (term: string) => {
    if (term.trim()) {
      setIsSearching(true);
      await searchTemplates(term);
      setIsSearching(false);
    } else {
      refreshTemplates();
    }
  }, []);

  useEffect(() => {
    handleSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, handleSearch]);

  const handleClearSearch = () => {
    setSearchTerm("");
    refreshTemplates();
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            WhatsApp Template Management
          </h1>
          <p className="text-gray-500">Create and manage your WhatsApp message templates</p>
        </div>

        {/* Search + Create */}
        <Card className="p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search templates..."
              className="pl-10 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                onClick={handleClearSearch}
                className="absolute right-0 top-0 text-gray-500 hover:text-gray-700 hover:bg-transparent"
              >
                ✕
              </Button>
            )}
          </div>
          <Button onClick={() => router.push("/dashboard/templates/create")}>
            <Plus className="w-4 h-4 mr-2" /> Create New Template
          </Button>
        </Card>

        {/* Search Info */}
        {searchTerm && (
          <Card className="p-3 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {isSearching ? "Searching..." : `Search results for "${searchTerm}"`}
              </span>
              <button
                onClick={handleClearSearch}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear search
              </button>
            </div>
          </Card>
        )}

        {/* Header Row */}
        <Card className="min-w-[900px]">
          <div className="grid grid-cols-6 gap-4 pl-6 font-semibold text-sm text-gray-700 dark:text-gray-300">
            <div>Name</div>
            <div>Category</div>
            <div>Status</div>
            <div>Type</div>
            <div>Created At</div>
            <div>Action</div>
          </div>
        </Card>

        {/* Template List */}
        <div className="space-y-3 mt-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="grid grid-cols-6 gap-4 items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </Card>
            ))
          ) : templates.length === 0 ? (
            <Card className="p-8 text-center">
              <p>No templates found. Create your first template!</p>
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="min-w-[900px] transition hover:shadow-md">
                <div className="grid grid-cols-6 gap-4 items-center pl-4 pr-4 text-sm">
                  <div className="flex items-center font-medium">
                    {getCategoryIcon(template.category)}
                    <span className="ml-2">{template.name}</span>
                  </div>
                  <div>{template.category}</div>
                  <div className="flex items-center">
                    {getStatusIcon(template.status ?? "")}
                    <Badge
                      className="ml-2"
                      variant={
                        template.status === "APPROVED"
                          ? "default"
                          : template.status === "PENDING"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {template.status}
                    </Badge>
                  </div>
                  <div>
                    {(() => {
                      const headerComponent = template.components.find((c) => c.type === "HEADER");
                      return headerComponent?.format || "TEXT";
                    })()}
                  </div>

                  <div>{template.createdAt ? new Date(template.createdAt).toLocaleDateString() : "—"}</div>
                  <div>
                    <DeleteTemplateDialog templateName={template.name} onTemplateDeleted={refreshTemplates} />
                  </div>
                </div>
              </Card>
            ))
          )}

          {hasMore && loadingMore && (
            Array.from({ length: 2 }).map((_, i) => (
              <Card key={`loading-more-${i}`} className="p-4">
                <div className="grid grid-cols-7 gap-4 items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
