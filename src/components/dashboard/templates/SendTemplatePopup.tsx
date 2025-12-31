"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, ChevronRight, X, Upload } from "lucide-react";
import { Template, TemplateHeaderComponentCreate } from "@/types/Template";
import { toast } from "@/components/ui/sonner";
import { uploadMediaApi } from "@/services/message/media.service";
import { MessagePayload, MessageType } from "@/types/MessageType";
import { useChatStore } from "@/store/chatStore";
import { ChatType } from "@/types/Chat";

interface TemplatePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (payload: any) => void; // adjust type to match your onSend
  templates: Template[];
}

export default function TemplatePopup({
  isOpen,
  onClose,
  onSend,
  templates,
}: TemplatePopupProps) {
  const { activeChat } = useChatStore();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false); // ✅ track load errors

  const isBroadcast = activeChat?.type === ChatType.BROADCAST;
  
  // Reset when popup opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate(null);
      setVariables({});
      setPreviewValues({});
    }
  }, [isOpen]);

  // Extract variables from template body
  const extractVariablesFromTemplate = (template: Template) => {
    const bodyComponent = template?.components?.find((c) => c.type === "BODY");
    if (!bodyComponent) return [];

    const text = (bodyComponent as any).text || "";
    const regex = /{{(\d+)}}/g;
    const matches = [...text.matchAll(regex)];
    // unique and sorted
    const unique = Array.from(new Set(matches.map((m) => m[1]))).map(Number).sort((a, b) => a - b);
    return unique.map((key) => ({
      key: String(key),
      placeholder: `{{${key}}}`,
      value: "",
    }));
  };

  // Filter templates based on search and category
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((template?.components?.find((c) => c.type === "BODY") as any)?.text || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesCategory = activeCategory === "all" || String(template.category) === String(activeCategory);

    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(templates.map((t) => String(t.category))))];

  // Handle template selection
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);

    const vars = extractVariablesFromTemplate(template);
    const initialVariables: Record<string, string> = {};
    const initialPreview: Record<string, string> = {};

    vars.forEach((v) => {
      initialVariables[v.key] = "";
      initialPreview[v.key] = `Sample ${v.key}`;
    });

    setVariables(initialVariables);
    setPreviewValues(initialPreview);
  };

  // Handle variable change
  const handleVariableChange = (key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  };

  // Handle preview value change
  const handlePreviewValueChange = (key: string, value: string) => {
    setPreviewValues((prev) => ({ ...prev, [key]: value }));
  };

  // Generate preview message (uses previewValues)
  const generatePreview = (template: Template, values: Record<string, string>) => {
    const bodyComponent = template?.components?.find((c) => c.type === "BODY");
    if (!bodyComponent) return "";

    let text = (bodyComponent as any).text || "";
    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      text = text.replace(regex, value || `{{${key}}}`);
    });
    return text;
  };

  
  /// --------------------------------------
  // Unified Handler: Validate (once) + Upload + Update Template
  // --------------------------------------
  const handleHeaderFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTemplate) return;

    const headerComp = selectedTemplate.components?.find(
      (c) => c.type === "HEADER"
    ) as any;

    if (!headerComp) {
      toast.error("Header component missing");
      return;
    }

    // ---- Upload directly (no second validation) ----
    setUploading(true)
    const mediaId = await uploadMediaApi(file);
    setUploading(false);
    if (!mediaId) {
      toast.error("Upload failed");
      return;
    }

    toast.success("Media uploaded");

    // ---- Update template header_handle ----
    setSelectedTemplate((prev) => {
      if (!prev) return prev;
      const components = prev.components?.map((c) => {
        if (c.type === "HEADER") {
          const header = c as TemplateHeaderComponentCreate;
          return {
            ...header,
            example: {
              ...(header.example ?? {}),
              header_handle: mediaId,
            },
          };
        }
        return c;
      }) as Template["components"];
      return { ...prev, components };
    });

    return mediaId;
  };


  // Fill variables into a template (cloned) — replaces {{n}} with provided values
  const getFilledTemplate = (template: Template, vars: Record<string, string>): Template => {
    const clone: Template = {
      ...template,
      components: template.components?.map((component) => {
        // if component has text, replace
        if (component && typeof (component as any).text === "string") {
          let updatedText = (component as any).text as string;
          Object.entries(vars).forEach(([k, v]) => {
            const regex = new RegExp(`{{${k}}}`, "g");
            updatedText = updatedText.replace(regex, v);
          });
          return { ...(component as any), text: updatedText };
        }
        return component;
      }),
    };
    return clone;
  };

  // Handle send
  const handleSend = async () => {
    if (!selectedTemplate) return;

    // Validate required variables are filled
    const extracted = extractVariablesFromTemplate(selectedTemplate);
    const missing = extracted.some((v) => !(variables[v.key] && variables[v.key].trim() !== ""));
    if (missing) {
      toast.error("Please fill all template variables");
      return;
    }

    // If header is media and no header_handle present -> require upload
    const headerComp = selectedTemplate.components?.find((c) => c.type === "HEADER") as any;
    if (headerComp && ["IMAGE", "VIDEO", "DOCUMENT"].includes(String(headerComp.format || "").toUpperCase())) {
      const headerHandle = (headerComp.example && (headerComp.example as any).header_handle) || null;
      if (!headerHandle) {
        toast.error("Please upload header media before sending this template");
        return;
      }
    }

    // Clone & replace variables into component texts
    const templatePayload = getFilledTemplate(selectedTemplate, variables);
    // console.log("Prepared Template Payload:", templatePayload);
    // Notify parent
    const messagePayload: MessagePayload = {
      participants: activeChat?.participants!,
      messageType: MessageType.TEMPLATE,
      template: templatePayload,
      chatType: isBroadcast ? ChatType.BROADCAST : ChatType.CHAT,
      chatId: activeChat?._id
    };
    onSend({ messagePayload });
    onClose();
  };

  // Render template preview
  const renderTemplatePreview = (template: Template) => {
    const body = template?.components?.find((c) => c.type === "BODY") as any;
    const header = template?.components?.find((c) => c.type === "HEADER") as any;
    const footer = template?.components?.find((c) => c.type === "FOOTER") as any;
    const buttons = template?.components?.find((c) => c.type === "BUTTONS") as any;

    return (
      <div className="space-y-3">
        {/* Header */}
        {header && header.text && (
          <div className="text-center font-semibold text-sm border-b pb-2">
            {header.text.length > 50 ? header.text.substring(0, 50) + "..." : header.text}
          </div>
        )}

        {/* Header media status */}
        {header && ["IMAGE", "VIDEO", "DOCUMENT"].includes(String(header.format || "").toUpperCase()) && (
          <div className="text-xs text-gray-500">
            Header media: {header.example?.header_handle ? (
              <span className="inline-flex items-center gap-2">
                <span className="font-medium">Uploaded</span>
                <Badge variant="outline" className="text-xs">{String(header.format)}</Badge>
              </span>
            ) : (
              <span className="text-amber-600">No media uploaded</span>
            )}
          </div>
        )}

        {/* Body preview */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <p className="text-sm">
            {generatePreview(template, previewValues)}
          </p>
        </div>

        {/* Footer */}
        {footer && footer.text && (
          <p className="text-xs text-gray-500">{footer.text}</p>
        )}

        {/* Buttons */}
        {buttons && buttons.buttons && (
          <div className="flex flex-wrap gap-2">
            {buttons.buttons.slice(0, 3).map((btn: any, i: number) => (
              <Badge key={i} variant="outline" className="text-xs">
                {btn.text}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select & Edit Template</DialogTitle>
          <DialogDescription>Choose a template message and fill in the variables</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Template List */}
          <div className="lg:col-span-1 space-y-4 overflow-hidden flex flex-col">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
                <TabsList className="w-full">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category} className="flex-1 capitalize">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredTemplates.map((template) => (
                <Card
                  key={template._id?.toString() || template.name}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedTemplate?._id === template._id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="capitalize text-xs">
                            {template.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.language}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm truncate">{template.name}</h4>
                        <p className="text-xs text-gray-500 truncate">
                          {((template?.components?.find((c) => c.type === "BODY") as any)?.text?.substring(0, 60)) ||
                            "No body text"}
                          ...
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Side - Template Editor */}
          <div className="lg:col-span-2 space-y-6 overflow-y-auto">
            {selectedTemplate ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedTemplate.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="capitalize">
                          {selectedTemplate.category}
                        </Badge>
                        <Badge variant="outline">{selectedTemplate.language}</Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)}>
                      <X className="w-4 h-4 mr-2" />
                      Change Template
                    </Button>
                  </div>

                  {/* If header is media, show upload control */}
                  {(() => {
                    const header = selectedTemplate.components?.find((c) => c.type === "HEADER") as any;
                    if (header && ["IMAGE", "VIDEO", "DOCUMENT"].includes(String(header.format || "").toUpperCase())) {
                      return (
                        <div className="grid gap-2">
                          <Label>Header Media</Label>
                          <div className="flex items-center gap-3">
                            <input
                              id="header-media-upload"
                              type="file"
                              accept={header.format === "IMAGE" ? "image/*" : header.format === "VIDEO" ? "video/*" : ".pdf,.doc,.docx,.xls,.xlsx"}
                              className="hidden"
                              onChange={handleHeaderFile}
                            />
                            <Button variant="outline" onClick={() => document.getElementById("header-media-upload")?.click()}>
                              <Upload className="w-4 h-4 mr-2" />
                              {header.example?.header_handle ? "Replace Media" : "Upload Media"}
                            </Button>
                            {header.example?.header_handle && (
                              <Badge variant="outline" className="text-xs">
                                uploaded
                              </Badge>
                            )}
                            {uploading && <span className="text-xs">Uploading...</span>}
                          </div>
                          <p className="text-xs text-gray-500">If template requires a media header, upload it here. Max 5MB.</p>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Variables Section */}
                  {Object.keys(variables).length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Fill Template Variables</h4>
                      <div className="grid gap-3">
                        {extractVariablesFromTemplate(selectedTemplate).map((variable) => (
                          <div key={variable.key} className="space-y-2">
                            <Label htmlFor={`var-${variable.key}`}>
                              Variable {variable.key}
                              <span className="text-xs text-gray-500 ml-2">{variable.placeholder}</span>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Input
                                  id={`var-${variable.key}`}
                                  placeholder={`Enter value for {{${variable.key}}}`}
                                  value={variables[variable.key]}
                                  onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                                />
                                <p className="text-xs text-gray-500">Actual value to be sent</p>
                              </div>
                              <div className="space-y-1">
                                <Input
                                  placeholder={`Preview value`}
                                  value={previewValues[variable.key]}
                                  onChange={(e) => handlePreviewValueChange(variable.key, e.target.value)}
                                />
                                <p className="text-xs text-gray-500">For preview only</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Section */}
                <div className="space-y-4">
                  <h4 className="font-medium">Preview</h4>
                  <Card className="bg-gray-50 dark:bg-gray-800">
                    <CardContent className="p-4">{renderTemplatePreview(selectedTemplate)}</CardContent>
                  </Card>
                </div>

                {/* Template Components Summary */}
                <div className="space-y-3">
                  <h4 className="font-medium">Template Components</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTemplate?.components?.map((component, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <span className="font-medium text-sm capitalize">{String(component.type).toLowerCase()}</span>
                        </div>
                        {component.type === "BODY" && (
                          <p className="text-xs text-gray-500 mt-1 truncate">{(component as any).text?.substring(0, 80)}...</p>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Template</h3>
                <p className="text-gray-500">Choose a template from the list to edit and send</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!selectedTemplate || Object.values(variables).some((v) => v.trim() === "")}>
            Send Template Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
