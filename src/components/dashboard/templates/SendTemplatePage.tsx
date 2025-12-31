"use client";

import { useState, useEffect } from "react";
import { Template, TemplateBodyComponentCreate, TemplateButtonsComponentCreate, TemplateHeaderComponentCreate } from "@/types/Template";
import { toast } from "@/components/ui/sonner";
import { fetchMediaBlob, uploadMediaApi } from "@/services/message/media.service";
import { MessagePayload, MessageStatus, MessageType } from "@/types/MessageType";
import { useChatStore } from "@/store/chatStore";
import { ChatType } from "@/types/Chat";
import MessagesHeader from "../messages/MessageHeader";
import IconButton from "@/components/common/IconButton";
import { useTemplates } from "@/hooks/template/useTemplate";
import { CenterLoader } from "@/components/common/Loader";
import MessagePreviewPage from "../messages/MessagePreviewPage";
import { Message } from "@/types/Message";
import TemplateSearchSelect from "./widgets/SearchableTemplateSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { TemplateButtonType, TemplateComponentType, TemplateHeaderType } from "@/utiles/enums/template";

interface SendTemplatePageProps {
  onClose: () => void;
  onSend: (payload: any) => void;
}

export default function SendTemplatePage({
  onClose,
  onSend,
}: SendTemplatePageProps) {
  const { activeChat } = useChatStore();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [uploading, setUploading] = useState(false);
  const { templates, loading: templateLoading, refreshTemplates, searchTemplates } = useTemplates({ isSend: true });
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [buttonVariables, setButtonVariables] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const isBroadcast = activeChat?.type === ChatType.BROADCAST;

  // Create preview message with dynamic values
  const fullMessage: Message = {
      _id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      chatId: activeChat?._id || crypto.randomUUID(),
      to: "91826XXXXXX",
      from: "81399XXXXX", // Replace with actual sender
      status: MessageStatus.Delivered,
      type: selectedTemplate ? MessageType.TEMPLATE : MessageType.TEXT,
      message: selectedTemplate ? "" : "Preview Message",
      createdAt: new Date().toISOString(),
      template: selectedTemplate ?? undefined,
  }

  // Get accepted file types based on header format
  const getAcceptedFileTypes = (headerFormat: TemplateHeaderType) => {
    switch (headerFormat) {
      case TemplateHeaderType.IMAGE:
        return "image/*";
      case TemplateHeaderType.VIDEO:
        return "video/*";
      case TemplateHeaderType.DOCUMENT:
        return ".pdf,.doc,.docx,.xls,.xlsx,.txt";
      default:
        return "*";
    }
  };

  // Handle header file upload
  const handleUploadHeaderMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTemplate) return;

    const headerComp: TemplateHeaderComponentCreate | undefined = selectedTemplate.components?.find(
      (c) => c.type === TemplateComponentType.HEADER
    ) as TemplateHeaderComponentCreate;

    if (!headerComp) {
      toast.error("Header component missing");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    setUploading(true);
    
    try {
      // Upload to server
      const mediaId = await uploadMediaApi(file);
      
      if (!mediaId) {
        toast.error("Upload failed");
        return;
      }
      
      // Fetch media URL
      const url = await fetchMediaBlob(mediaId);
      setMediaUrl(url);
      
      // Update template with media handle
      setSelectedTemplate((prev) => {
        if (!prev) return prev;
        const components = prev.components?.map((c) => {
          if (c.type === TemplateComponentType.HEADER) {
            const header: TemplateHeaderComponentCreate = c as TemplateHeaderComponentCreate;
            return {
              ...header,
              example: {
                ...(header.example ?? {}),
                header_handle: [mediaId],
              },
            };
          }
          return c;
        });
        return { ...prev, components };
      });

      toast.success("Media uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload media");
    } finally {
      setUploading(false);
      // Clear file input
      e.target.value = "";
    }
  };

  // Handle header remove media
  const handleRemoveHeaderMedia = () => {
    setSelectedTemplate((prev) => {
      if (!prev) return prev;

      const components = prev.components?.map((c) => {
        if (c.type === TemplateComponentType.HEADER) {
          const header = c as TemplateHeaderComponentCreate;
          return {
            ...header,
            example: {
              ...(header.example ?? {}),
              header_handle: undefined,
            },
          };
        }
        return c;
      });

      return { ...prev, components };
    });

    setMediaUrl(null);
  };
  
  // Extract variables from template header
  const extractHeaderVariable = () => {
    if (!selectedTemplate) return null;

    const headerComp: TemplateHeaderComponentCreate | undefined = selectedTemplate.components?.find(
      c => c.type === TemplateComponentType.HEADER
    );
    
    if (!headerComp?.text) return null;
    
    const match = headerComp.text.match(/{{(\d+)}}/);
    
    // Header example values (first example row)
    const exampleValues = headerComp.example?.header_text?.[0] ?? [];

    if (match) {
      return {
        key: match[1],
        placeholder: match[0],
        value: exampleValues
      };
    }
    return null;
  };

  // Extract variables from template body
  const extractBodyVariables = () => {
    if (!selectedTemplate) return null;

    const bodyComponent: TemplateBodyComponentCreate | undefined =
      selectedTemplate?.components?.find(
        (c) => c.type === TemplateComponentType.BODY
      );

    if (!bodyComponent?.text) return [];

    const regex = /{{(\d+)}}/g;
    const matches = [...bodyComponent.text.matchAll(regex)];

    const keys = Array.from(
      new Set(matches.map((m) => Number(m[1])))
    ).sort((a, b) => a - b);

    const exampleValues = bodyComponent.example?.body_text?.[0] ?? [];

    return keys.map((key) => ({
      key: String(key),
      placeholder: `{{${key}}}`,
      value: exampleValues[key - 1] ?? "", // 👈 READ FROM TEMPLATE
    }));
  };
  const bodyVariables = extractBodyVariables() || [];

  // Extract button variables from template
  const extractButtonVariables = () => {
    if (!selectedTemplate) return null;

    const buttonsComp: TemplateButtonsComponentCreate | undefined = selectedTemplate.components?.find(
      (c) => c.type === TemplateComponentType.BUTTONS);

    if (!buttonsComp?.buttons) return [];

    return buttonsComp.buttons.map((btn: any, index: number) => {
        // COPY_CODE → always one variable
        if (btn.type === TemplateButtonType.COPY_CODE) {
          return {
            key: `copy_code_${index}`,
            type: TemplateButtonType.COPY_CODE,
            label: "Copy Code",
            placeholder: "{{1}}",
            value: btn.example?.[0] || "",
            index,
          };
        }

        // URL → only if contains variable
        if (btn.type === TemplateButtonType.URL && /{{\d+}}/.test(btn.url || "")) {
          return {
            key: `url_${index}`,
            type: TemplateButtonType.URL,
            label: "URL Variable",
            placeholder: btn.url.match(/{{(\d+)}}/)?.[0] || "{{1}}",
            value: btn.example?.[0] || "",
            index,
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  const buttonsVariables = extractButtonVariables() || [];

  const updateHeaderVariable = (value: string) => {
    if (!selectedTemplate) return;

    const headerComponent = selectedTemplate.components?.find(
      (c) => c.type === TemplateComponentType.HEADER
    );

    if (!headerComponent) return;

    // Ensure example structure exists
    headerComponent.example ??= {};
    headerComponent.example.header_text ??= [];

    // Header has only ONE variable → index 0
    headerComponent.example.header_text[0] = value;

    // Trigger re-render
    setSelectedTemplate({ ...selectedTemplate });
  };
  
  const updateBodyVariable = ( key: string, value: string ) => {
    if (!selectedTemplate) return;

    const bodyComponent = selectedTemplate.components?.find(
      (c) => c.type === TemplateComponentType.BODY
    );

    if (!bodyComponent) return;

    // Ensure example structure exists
    bodyComponent.example ??= {};
    bodyComponent.example.body_text ??= [[]];
    bodyComponent.example.body_text[0] ??= [];

    // {{1}} -> index 0
    bodyComponent.example.body_text[0][Number(key) - 1] = value;

    // Trigger re-render
    setSelectedTemplate({ ...selectedTemplate });
  };

  const updateButtonVariable = (
    buttonIndex: number,
    value: string
  ) => {
    if (!selectedTemplate) return;

    const buttonsComponent = selectedTemplate.components?.find(
      (c) => c.type === TemplateComponentType.BUTTONS
    ) as TemplateButtonsComponentCreate | undefined;

    if (!buttonsComponent?.buttons?.[buttonIndex]) return;

    const button = buttonsComponent.buttons[buttonIndex];

    // COPY_CODE → example is [string]
    if (button.type === TemplateButtonType.COPY_CODE) {
      button.example = [value];
    }

    // URL → example is also [string]
    if (button.type === TemplateButtonType.URL) {
      button.example = [value];
    }

    // QUICK_REPLY → no example (do nothing)

    setSelectedTemplate({ ...selectedTemplate });
  };

  // Handle send
  const handleSend = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    setIsSending(true);

    try {
      // Create message payload
      const messagePayload: MessagePayload = {
        participants: activeChat?.participants!,
        messageType: MessageType.TEMPLATE,
        template: selectedTemplate,
        chatType: isBroadcast ? ChatType.BROADCAST : ChatType.CHAT,
        chatId: activeChat?._id
      };

      // Send to parent
      onSend({ messagePayload });
      toast.success("Template sent successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to send template");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#161717]">
      {/* Header */}
      <MessagesHeader onBack={onClose} />

      {/* Template Variable Inputs */}
      <div className="flex flex-col md:flex-row gap-6 p-4 border-t dark:border-gray-800">
        <div className="flex-6">

          <div className="flex gap-2 items-center">
            {/* Template search select */}
            <TemplateSearchSelect
              templates={templates}
              selectedTemplate={selectedTemplate || undefined}
              onChange={(template) => {
                setSelectedTemplate(template);
                setButtonVariables({});
              }}
              onSearch={searchTemplates}
              loading={templateLoading}
            />
            <IconButton
              className="flex-1"
              IconSrc="/assets/icons/close.svg"
              label="Close"
              onClick={onClose}
            />
          </div>
          
          {/* Template Variable Inputs */}
          {selectedTemplate && (
            <div className="mt-4 space-y-4">
              {/* Header Section */}
              {selectedTemplate.components?.find(c => c.type === TemplateComponentType.HEADER) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Header</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {/* Header Text Variables */}
                    {(() => {
                      const headerComp:TemplateHeaderComponentCreate | undefined = selectedTemplate.components?.find(
                        c => c.type === TemplateComponentType.HEADER);
                      const headerVar = extractHeaderVariable();
                      if (headerComp?.text && headerVar) {
                        if (headerVar) {
                          return (
                            <div className="grid gap-2">
                              <Label className="mb-2 block">
                                Header Variable
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <input
                                type="text"
                                value={headerVar.value || ""}
                                onChange={(e) => updateHeaderVariable(e.target.value)}
                                placeholder={`Enter value for ${headerVar.placeholder}`}
                                className="w-full border rounded-md px-3 py-2 text-sm"
                              />
                            </div>
                          );
                        }
                      }
                      return null;
                    })()}

                    {/* Header Media Upload */}
                    {(() => {
                      const headerComp = selectedTemplate.components?.find(
                        c => c.type === TemplateComponentType.HEADER
                      ) as TemplateHeaderComponentCreate;
                      
                      const headerFormat = headerComp?.format;
                      const hasMediaUploaded = headerComp?.example?.header_handle?.[0];
                      
                      return headerFormat && ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerFormat) ? (
                        <div>
                          <Label className="mb-2 block">
                            {headerFormat.charAt(0) + headerFormat.slice(1).toLowerCase()} Upload
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          
                          {hasMediaUploaded ? (
                            <div className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {headerFormat === "IMAGE" && (
                                    <img src="/assets/icons/image.svg" className="w-5 h-5" alt="Image" />
                                  )}
                                  {headerFormat === "VIDEO" && (
                                    <img src="/assets/icons/video.svg" className="w-5 h-5" alt="Video" />
                                  )}
                                  {headerFormat === "DOCUMENT" && (
                                    <img src="/assets/icons/document.svg" className="w-5 h-5" alt="Document" />
                                  )}
                                  <span className="text-sm font-medium truncate">
                                    {headerFormat.toLowerCase()} uploaded
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleRemoveHeaderMedia}
                                  className="h-8 w-8 p-0"
                                >
                                  <div className="w-4 h-4 flex items-center justify-center">✕</div>
                                </Button>
                              </div>
                              {headerFormat === "IMAGE" && hasMediaUploaded && (
                                <div className="mt-2 flex justify-center">
                                  <img
                                    src={mediaUrl || hasMediaUploaded || "/placeholder.png"}
                                    alt="Header preview"
                                    className="rounded-md max-w-70 max-h-64 object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500 mb-2">
                                Upload {headerFormat.toLowerCase()} for header
                              </p>
                              <p className="text-xs text-gray-400 mb-4">
                                Max file size: 5MB
                              </p>
                              <div className="flex flex-col gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById('header-media-upload')?.click()}
                                  disabled={uploading}
                                  className="flex items-center gap-2"
                                >
                                  {uploading ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4" />
                                      Choose File
                                    </>
                                  )}
                                </Button>
                                <input
                                  id="header-media-upload"
                                  type="file"
                                  accept={getAcceptedFileTypes(headerFormat)}
                                  onChange={handleUploadHeaderMedia}
                                  className="hidden"
                                  disabled={uploading}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Body Variables */}
              {bodyVariables.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Body Variables</CardTitle>
                  </CardHeader>

                  <CardContent className="grid gap-4">
                    {bodyVariables.map((variable) => (
                      <div key={variable.key} className="grid gap-2">
                        <Label className="mb-2 block">
                          Variable {variable.placeholder}
                          <span className="text-red-500 ml-1">*</span>
                        </Label>

                        <input
                          type="text"
                          value={variable.value || ""}
                          onChange={(e) =>
                            updateBodyVariable(variable.key, e.target.value)
                          }
                          placeholder={`Enter value for ${variable.placeholder}`}
                          className="w-full border rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Button Variables */}
              {buttonsVariables.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Button Variables</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {buttonsVariables.map((variable: any) => (
                      <div key={variable.key} className="grid gap-2">
                        <Label className="mb-2 block">
                          {variable.type === TemplateButtonType.COPY_CODE
                            ? "Copy Code Value"
                            : "Button URL Variable"}{" "}
                          {variable.placeholder}
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <input
                          type="text"
                          value={variable.value || ""}
                          onChange={(e) =>
                            updateButtonVariable(
                              variable.index,
                              e.target.value
                            )
                          }
                          placeholder={`Enter value for ${variable.placeholder}`}
                          className="w-full border rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Submit */}
          <Button onClick={handleSend} disabled={isSending && !selectedTemplate} 
          className="w-full mt-4 mb-10 bg-[#21C063] hover:bg-[#1da955]">
            {isSending ? "Template sending..." : "Send Template"}
          </Button>
        </div>

        {/* Right Section - WhatsApp Preview */}
        <div className="flex-3 w-full md:w-[360px] self-start sticky top-10">
          <MessagePreviewPage messages={[fullMessage]} isMine={true} />
        </div>
      </div>
    </div>
  );
}