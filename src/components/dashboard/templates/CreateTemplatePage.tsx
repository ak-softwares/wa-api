"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Info, Plus, X, Upload, Image as ImageIcon, Video, File, Trash2 } from "lucide-react";
import { TemplateBodyComponentCreate, TemplateButton, TemplateButtonsComponentCreate, TemplateComponentCreate, TemplateFooterComponentCreate, TemplateHeaderComponentCreate } from "@/types/Template";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import IconButton from "@/components/common/IconButton";
import { useTemplateStore } from "@/store/templateStore";
import { 
  TemplateComponentType, 
  TemplateHeaderType, 
  TemplateCategory, 
  TemplateButtonType
} from "@/utiles/enums/template";
import MessagePreviewPage from "../messages/MessagePreviewPage";
import { MessageType } from "@/types/MessageType";
import { MessageStatus } from "@/types/MessageType";
import { Message } from "@/types/Message";

export default function CreateTemplatePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>(TemplateCategory.UTILITY);
  const [templateLanguage, setTemplateLanguage] = useState("en");
  const [headerFormat, setHeaderFormat] = useState<TemplateHeaderType>(TemplateHeaderType.TEXT);
  const [headerText, setHeaderText] = useState("");
  const [headerMedia, setHeaderMedia] = useState<{
    file: File | null;
    previewUrl: string | null;
    fileName: string;
  }>({
    file: null,
    previewUrl: null,
    fileName: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [bodyText, setBodyText] = useState("Hello");
  const router = useRouter();
  const [headerSampleValues, setHeaderSampleValues] = useState("");
  const [bodySampleValues, setBodySampleValues] = useState([""]);
  const [isVariableAddedInButtonUrl, setIsVariableAddedInButtonUrl] = useState(false);
  const [urlSampleValues, setUrlSampleValues] = useState("");
  const [copyCodeSampleValues, setCopyCodeSampleValues] = useState("");
  const [footerText, setFooterText] = useState("");
  const { duplicateTemplateData, setDuplicateTemplateData, setEditTemplateData, editTemplateData, setSelectedTemplateMenu } = useTemplateStore();
  const [buttons, setButtons] = useState<TemplateButton[]>([
    { type: TemplateButtonType.QUICK_REPLY, text: "" }
  ]);
  const [isEdit, setIsEdit] = useState(false);

  const fullMessage: Message = {
    _id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    chatId: crypto.randomUUID(),

    to: "91826XXXXXX",        // you can replace with real example number
    from: "81399XXXXX",

    status: MessageStatus.Delivered,
    type: MessageType.TEMPLATE,
    createdAt: new Date().toISOString(),

    template: {
      _id: crypto.randomUUID(),
      id: templateId || "temp_preview", // REAL FIELD
      userId: crypto.randomUUID(),
      waAccountId: crypto.randomUUID(),

      name: templateName || "Untitled Template", // REAL FIELD
      category: templateCategory,                // REAL FIELD
      language: templateLanguage,                // REAL FIELD

      components: [
        {
          type: TemplateComponentType.HEADER,
          format: headerFormat,
          text: headerFormat === TemplateHeaderType.TEXT ? headerText : undefined,
          example:
            headerFormat !== TemplateHeaderType.TEXT && headerMedia.previewUrl
              ? { header_handle: [headerMedia.previewUrl] }
              : /\{\{\d+\}\}/.test(headerText)
                  ? {
                      header_text: [headerSampleValues],   // 👈 SAME VALUES ADDED HERE
                    }
                  : undefined,
        },
        {
          type: TemplateComponentType.BODY,
          text: bodyText || "",
          example: /\{\{\d+\}\}/.test(bodyText)
              ? {
                  body_text: [bodySampleValues],   // 👈 SAME VALUES ADDED HERE
                }
              : undefined,
        },
        footerText
          ? {
              type: TemplateComponentType.FOOTER,
              text: footerText
            }
          : null,
        buttons.filter(btn => btn.text!.trim()).length > 0
          ? {
              type: TemplateComponentType.BUTTONS,
              buttons: buttons
            }
          : null
      ].filter(Boolean) as any, // remove empty components

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  };

  useEffect(() => {
    if (editTemplateData) {
      setIsEdit(true);
      // Duplicate basic fields
      setTemplateId(editTemplateData.id || "");
      setTemplateName(editTemplateData.name);
      setTemplateCategory(editTemplateData.category as TemplateCategory);
      setTemplateLanguage(editTemplateData.language || "en");

      // Reset header, footer, body, and buttons based on components
      const headerComp = editTemplateData?.components?.find(c => c.type === TemplateComponentType.HEADER) as TemplateHeaderComponentCreate | undefined;
      const bodyComp = editTemplateData?.components?.find(c => c.type === TemplateComponentType.BODY) as TemplateBodyComponentCreate | undefined;
      const footerComp = editTemplateData?.components?.find(c => c.type === TemplateComponentType.FOOTER) as TemplateFooterComponentCreate | undefined;
      const buttonsComp = editTemplateData?.components?.find(c => c.type === TemplateComponentType.BUTTONS) as TemplateButtonsComponentCreate | undefined;

      setHeaderFormat(headerComp?.format || TemplateHeaderType.TEXT);
      setHeaderText(headerComp?.text || "");
      
      // Handle media header if present in duplicate data
      if (headerComp?.format !== TemplateHeaderType.TEXT && headerComp?.format !== TemplateHeaderType.LOCATION) {
        // You might want to handle media duplication differently
        // For now, just set empty media
        setHeaderMedia({
          file: null,
          previewUrl: null,
          fileName: ""
        });
      }
      
      setBodyText(bodyComp?.text || "");
      setFooterText(footerComp?.text || "");
      setButtons(buttonsComp?.buttons?.map(btn => ({ ...btn })) || [{ type: TemplateButtonType.QUICK_REPLY, text: "" }]);
      // Optionally clear editTemplateData after loading
      setEditTemplateData(null);
    }
  }, [editTemplateData, setEditTemplateData]);
  
  useEffect(() => {
    if (duplicateTemplateData) {
      // Duplicate basic fields
      setTemplateName(duplicateTemplateData.name + "_copy");
      setTemplateCategory(duplicateTemplateData.category as TemplateCategory);
      setTemplateLanguage(duplicateTemplateData.language || "en");

      // Reset header, footer, body, and buttons based on components
      const headerComp = duplicateTemplateData?.components?.find(c => c.type === TemplateComponentType.HEADER) as TemplateHeaderComponentCreate | undefined;
      const bodyComp = duplicateTemplateData?.components?.find(c => c.type === TemplateComponentType.BODY) as TemplateBodyComponentCreate | undefined;
      const footerComp = duplicateTemplateData?.components?.find(c => c.type === TemplateComponentType.FOOTER) as TemplateFooterComponentCreate | undefined;
      const buttonsComp = duplicateTemplateData?.components?.find(c => c.type === TemplateComponentType.BUTTONS) as TemplateButtonsComponentCreate | undefined;

      setHeaderFormat(headerComp?.format || TemplateHeaderType.TEXT);
      setHeaderText(headerComp?.text || "");
      
      // Handle media header if present in duplicate data
      if (headerComp?.format !== TemplateHeaderType.TEXT && headerComp?.format !== TemplateHeaderType.LOCATION) {
        // You might want to handle media duplication differently
        // For now, just set empty media
        setHeaderMedia({
          file: null,
          previewUrl: null,
          fileName: ""
        });
      }
      
      setBodyText(bodyComp?.text || "");
      setFooterText(footerComp?.text || "");
      setButtons(buttonsComp?.buttons?.map(btn => ({ ...btn })) || [{ type: TemplateButtonType.QUICK_REPLY, text: "" }]);
      // Optionally clear duplicateTemplateData after loading
      setDuplicateTemplateData(null);
    }
  }, [duplicateTemplateData, setDuplicateTemplateData]);

    // Reset header media when format changes
  useEffect(() => {
    if (headerFormat === TemplateHeaderType.TEXT || headerFormat === TemplateHeaderType.LOCATION) {
      // Clear media if switching to non-media header type
      removeMedia();
    }
  }, [headerFormat]);

  useEffect(() => {
    if (!isVariableAddedInButtonUrl || !urlSampleValues) return;

    setButtons((prev) =>
      prev.map((btn) =>
        btn.type === TemplateButtonType.URL
          ? { ...btn, example: [urlSampleValues] }
          : btn
      )
    );
  }, [urlSampleValues, isVariableAddedInButtonUrl]);

  useEffect(() => {
    if (!copyCodeSampleValues) return;

    setButtons((prev) =>
      prev.map((btn) =>
        btn.type === TemplateButtonType.COPY_CODE
          ? { ...btn, example: [copyCodeSampleValues] }
          : btn
      )
    );
  }, [copyCodeSampleValues]);

  // Handle media upload
  const handleMediaUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Validate file size (e.g., 5MB max for WhatsApp templates)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type based on header format
      if (headerFormat === TemplateHeaderType.IMAGE && !file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      if (headerFormat === TemplateHeaderType.VIDEO && !file.type.startsWith('video/')) {
        toast.error("Please select a video file");
        return;
      }
      
      if (headerFormat === TemplateHeaderType.DOCUMENT && !['application/pdf', 'application/vnd.ms-excel', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].some(type => file.type.includes(type))) {
        toast.error("Please select a valid document (PDF, Excel, Word)");
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      setHeaderMedia({
        file,
        previewUrl,
        fileName: file.name
      });
      
      toast.success("Media uploaded successfully");
      
    } catch (error) {
      toast.error("Failed to upload media");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleMediaUpload(file);
    }
  };

  // Remove media
  const removeMedia = () => {
    if (headerMedia.previewUrl) {
      URL.revokeObjectURL(headerMedia.previewUrl);
    }
    setHeaderMedia({
      file: null,
      previewUrl: null,
      fileName: ""
    });
  };

  function toMetaTemplateName(input: string): string {
    return input
      .toLowerCase()
      .replace(/\s+/g, "_")       // space → underscore immediately
      .replace(/[^a-z0-9_]/g, "")
      .replace(/_+/g, "_");
  }

  // Get accepted file types based on header format
  const getAcceptedFileTypes = () => {
    switch (headerFormat) {
      case TemplateHeaderType.IMAGE:
        return "image/*";
      case TemplateHeaderType.VIDEO:
        return "video/*";
      case TemplateHeaderType.DOCUMENT:
        return ".pdf,.doc,.docx,.xls,.xlsx";
      default:
        return "*";
    }
  };

  // Extract variables from body text
  const extractVariables = (text: string) => {
    const regex = /{{(\d+)}}/g;
    const matches = [...text.matchAll(regex)];
    return matches.map(match => parseInt(match[1])).sort((a, b) => a - b);
  };

  const headerVariables = extractVariables(headerText);
  const bodyVariables = extractVariables(bodyText);

  // Update sample values when variables change
  const updateSampleValues = (newVariables: number[]) => {
    const newSampleValues = [...bodySampleValues];
    
    if (newSampleValues.length > newVariables.length) {
      newSampleValues.splice(newVariables.length);
    }
    
    while (newSampleValues.length < newVariables.length) {
      newSampleValues.push(`Sample ${newSampleValues.length + 1}`);
    }
    
    setBodySampleValues(newSampleValues);
  };

  // Handle body text change
  const handleBodyTextChange = (value: string) => {
    setBodyText(value);
    const newVariables = extractVariables(value);
    updateSampleValues(newVariables);
  };

  // Add variable to body text
  const addVariableInBody = () => {
    const nextVarNumber = bodyVariables.length > 0 ? Math.max(...bodyVariables) + 1 : 1;
    const newBodyText = `${bodyText} {{${nextVarNumber}}}`;
    setBodyText(newBodyText);
    updateSampleValues([...bodyVariables, nextVarNumber]);
  };

  // Add variable to header text
  const addVariableInHeader = () => {
    const nextVarNumber = headerVariables.length > 0 ? Math.max(...headerVariables) + 1 : 1;
    const newHeaderText = `${headerText} {{${nextVarNumber}}}`;
    setHeaderText(newHeaderText);
    // updateSampleValues([...headerVariables, nextVarNumber]);
  };

  const addVariableInUrlButton = (index: number) => {
    setIsVariableAddedInButtonUrl(true);

    const button = buttons[index];
    if (button.type !== TemplateButtonType.URL) return;
    const currentUrl = button.url || "";
    if (currentUrl.includes("{{1}}")) return;
    updateButton(index, "url", `${currentUrl}{{1}}`);

  };

  const removeVariableInUrlButton = (index: number) => {
    const button = buttons[index];
    if (button.type !== TemplateButtonType.URL) return;

    const updatedUrl = button.url.replace(/\{\{1\}\}/g, "");
    updateButton(index, "url", updatedUrl);

    setIsVariableAddedInButtonUrl(false);
    setUrlSampleValues("");
  };

  // Button management
  const addButton = () => {
    if (buttons.length < 3) { // WhatsApp allows max 3 buttons
      setButtons([...buttons, { type: TemplateButtonType.QUICK_REPLY, text: "" }]);
    }
  };

  const updateButton = (index: number, field: string, value: string) => {
    const updatedButtons = [...buttons];
    
    // 🚫 Prevent invalid keys like "URL"
    if (field === "URL") return;

    if (field === "type") {
      // Reset button data when type changes
      updatedButtons[index] = {
        type: value as TemplateButtonType.URL | TemplateButtonType.QUICK_REPLY | TemplateButtonType.PHONE_NUMBER | TemplateButtonType.COPY_CODE,
        text: updatedButtons[index].text,
        ...(value === TemplateButtonType.URL ? { url: "" } : 
            value === TemplateButtonType.PHONE_NUMBER ? { phone_number: "" } : {})
      } as TemplateButton;
    } else {
      updatedButtons[index] = {
        ...updatedButtons[index],
        [field]: value
      };
    }
    
    // ✅ URL button → add example when variable exists
    if ( updatedButtons[index].type === TemplateButtonType.URL && isVariableAddedInButtonUrl && urlSampleValues) {
      updatedButtons[index] = {
        ...updatedButtons[index],
        example: [urlSampleValues],
      };
    } else if (updatedButtons[index].type === TemplateButtonType.URL) {
      // remove example if variable removed
      delete (updatedButtons[index] as any).example;
    }

    // ✅ COPY_CODE button → always add example
    if (updatedButtons[index].type === TemplateButtonType.COPY_CODE && copyCodeSampleValues && field === "copy_code") {
      updatedButtons[index] = {
        ...updatedButtons[index],
        example: [copyCodeSampleValues],
      };
    } else if (updatedButtons[index].type === TemplateButtonType.COPY_CODE) {
      // remove example if variable removed
      delete (updatedButtons[index] as any).example;
    }

    setButtons(updatedButtons);
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };


  // Get header icon based on format
  const getHeaderIcon = () => {
    switch (headerFormat) {
      case TemplateHeaderType.IMAGE:
        return <ImageIcon className="w-4 h-4" />;
      case TemplateHeaderType.VIDEO:
        return <Video className="w-4 h-4" />;
      case TemplateHeaderType.DOCUMENT:
        return <File className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const saveTemplate = async () => {
    try {
      setIsSaving(true);
      
      // Validate required fields
      if (!templateName.trim()) {
        toast.error("Template name is required");
        return;
      }
      
      if (templateCategory !== TemplateCategory.AUTHENTICATION && !bodyText.trim()) {
        toast.error("Body text is required");
        return;
      }

      // Validate media for media-based headers
      if ([TemplateHeaderType.IMAGE, TemplateHeaderType.VIDEO, TemplateHeaderType.DOCUMENT].includes(headerFormat) && !headerMedia.file) {
        toast.error(`Please upload a ${headerFormat.toLowerCase()} for the header`);
        return;
      }

      // Build components array according to the API model
      const components: TemplateComponentCreate[] = [];

      /* =========================
        AUTHENTICATION TEMPLATE
      ========================= */
      if (templateCategory === TemplateCategory.AUTHENTICATION) {
        components.push(
          {
            type: TemplateComponentType.BODY,
            example: {
              body_text: [["123456"]],
            },
          },
          {
            type: TemplateComponentType.BUTTONS,
            buttons: [
              {
                type: TemplateButtonType.OTP,
                otp_type: TemplateButtonType.COPY_CODE,
              },
            ],
          }
        );
      }

      /* =========================
        OTHER TEMPLATES (UTILITY / MARKETING)
      ========================= */
      else {
        // Add HEADER component if header content is provided
        if (headerFormat === TemplateHeaderType.TEXT && headerText.trim()) {
          const hasVariables = /\{\{\d+\}\}/.test(headerText);

          const headerComponent: TemplateHeaderComponentCreate = {
            type: TemplateComponentType.HEADER,
            format: headerFormat,
            text: headerText,
          };

          // Add example ONLY when variables exist
          if (hasVariables) {
            headerComponent.example = {
              header_text: [headerSampleValues],
            };
          }

          components.push(headerComponent);

        } else if ([TemplateHeaderType.IMAGE, TemplateHeaderType.VIDEO, TemplateHeaderType.DOCUMENT].includes(headerFormat) && headerMedia.file) {
          // For media headers, we need to upload the file first
          const formData = new FormData();
          formData.append('file', headerMedia.file);
          
          try {
            const uploadResponse = await fetch('/api/whatsapp/templates/upload-media', {
              method: 'POST',
              body: formData,
            });
            
            const uploadData = await uploadResponse.json();

            if (!uploadData.success) {
              throw new Error(uploadData.message || "Failed to upload media");
            }

            const mediaHandle = uploadData.data.header_handle; // <-- VERY IMPORTANT
            // Now push correct HEADER component with handle
            components.push({
              type: TemplateComponentType.HEADER,
              format: headerFormat,
              ...(headerFormat === TemplateHeaderType.IMAGE && {
                example: { header_handle: mediaHandle },
              }),
              ...(headerFormat === TemplateHeaderType.VIDEO && {
                example: { header_handle: mediaHandle },
              }),
              ...(headerFormat === TemplateHeaderType.DOCUMENT && {
                example: {
                  header_handle: mediaHandle,
                },
              }),
            });
          } catch (uploadError) {
            toast.error("Failed to upload media file");
            throw uploadError;
          }
        }

        // Add BODY component (required)
        if (bodyText.trim()) {
          const hasVariables = /\{\{\d+\}\}/.test(bodyText);

          const bodyComponent: TemplateBodyComponentCreate = {
            type: TemplateComponentType.BODY,
            text: bodyText,
          };

          // Add example ONLY when variables exist
          if (hasVariables) {
            bodyComponent.example = {
              body_text: [bodySampleValues],
            };
          }

          components.push(bodyComponent);
        }


        // Add FOOTER component if footer text is provided
        if (footerText.trim()) {
          const footerComponent: TemplateFooterComponentCreate = {
            type: TemplateComponentType.FOOTER,
            text: footerText,
          };
          components.push(footerComponent);
        }

        // Add BUTTONS component if buttons are provided
        const validButtons = buttons.filter(btn => btn?.text!.trim());
        if (validButtons.length > 0) {
          const buttonsComponent: TemplateButtonsComponentCreate = {
            type: TemplateComponentType.BUTTONS,
            buttons: validButtons,
          };
          components.push(buttonsComponent);
        }
      }
      // console.log("Final Components to be sent:", components);
      const templateData = {
        id: templateId,
        name: templateName,
        category: templateCategory,
        language: templateLanguage,
        components,
      };

      let res;
      if (isEdit) {
        res = await fetch("/api/whatsapp/templates", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(templateData),
        });
      }else {
        res = await fetch("/api/whatsapp/templates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(templateData),
        });
      }

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        // Reset form
        setTemplateCategory(TemplateCategory.UTILITY);
        setTemplateName("");
        setBodyText("Hello");
        setHeaderText("");
        setFooterText("");
        setHeaderMedia({
          file: null,
          previewUrl: null,
          fileName: ""
        });
        setButtons([{ type: TemplateButtonType.QUICK_REPLY, text: "" }]);
        setSelectedTemplateMenu(null);
        router.refresh();
      } else {
        toast.error(data.message)
      }
    } catch (error: any) {
      toast.error("Something went wrong " + error.message)
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 flex items-center justify-between">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <IconButton
            onClick={() => setSelectedTemplateMenu(null)}
            label="Back"
            IconSrc="/assets/icons/arrow-left.svg"
          />
          <h1 className="text-xl font-semibold">{`${isEdit ? "Edit" : "Add"} Template`}</h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 p-6">
        {/* Left Section */}
        <div className="flex-6 space-y-6">
          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Template Category</Label>
                <Select value={templateCategory} onValueChange={(value: TemplateCategory) => setTemplateCategory(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TemplateCategory.UTILITY}>Utility</SelectItem>
                    <SelectItem value={TemplateCategory.MARKETING}>Marketing</SelectItem>
                    <SelectItem value={TemplateCategory.AUTHENTICATION}>Authentication</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Template Language</Label>
                <Select value={templateLanguage} onValueChange={setTemplateLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (en)</SelectItem>
                    <SelectItem value="hi">Hindi (hi)</SelectItem>
                    <SelectItem value="es">Spanish (es)</SelectItem>
                    <SelectItem value="fr">French (fr)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Template Name</Label>
                <div className="relative group">
                  <Input
                    value={templateName}
                  onChange={(e) => setTemplateName(toMetaTemplateName(e.target.value))}
                    placeholder="e.g. order_update_code"
                    className="pr-10"
                  />
                  <Info className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 cursor-pointer" />
                  <div className="absolute right-0 top-full mt-1 hidden w-72 rounded-md bg-gray-800 text-white text-xs p-2 shadow-md group-hover:block z-10">
                    Name can only be in lowercase alphanumeric characters and underscores.
                    Special characters and white-space are not allowed.
                    Example: app_verification_code
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Header Section */}
          {/* ❌ do NOT add header for AUTHENTICATION */}
          {templateCategory !== TemplateCategory.AUTHENTICATION && (
            <Card>
              <CardHeader>
                <CardTitle>Header (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Header Format</Label>
                  <Select value={headerFormat} onValueChange={(value: TemplateHeaderType) => setHeaderFormat(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TemplateHeaderType.TEXT}>Text</SelectItem>
                      <SelectItem value={TemplateHeaderType.IMAGE}>Image</SelectItem>
                      <SelectItem value={TemplateHeaderType.VIDEO}>Video</SelectItem>
                      <SelectItem value={TemplateHeaderType.DOCUMENT}>Document</SelectItem>
                      <SelectItem value={TemplateHeaderType.LOCATION}>Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {headerFormat === TemplateHeaderType.TEXT && (
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label>Header Text</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        disabled={headerVariables.length >= 1}
                        onClick={addVariableInHeader}
                        className="flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Variable
                      </Button>
                    </div>
                    <Input
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      placeholder="Enter header text"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500">
                      {headerText.length}/60 characters
                    </p>
                    {/* Dynamic Sample Value Inputs */}
                    {headerVariables.length > 0 && (
                      <div className="grid gap-2">
                        <Label>Sample Values for Preview</Label>
                        {headerVariables.map((varNum, index) => (
                          <div key={varNum} className="flex gap-2 items-center">
                            <Label className="w-8 text-sm">{`{{${varNum}}}`}</Label>
                            <Input
                              value={headerSampleValues || ""}
                              onChange={(e) => setHeaderSampleValues(e.target.value)}
                              placeholder={`Enter sample value for {{${varNum}}}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {[TemplateHeaderType.IMAGE, TemplateHeaderType.VIDEO, TemplateHeaderType.DOCUMENT].includes(headerFormat) && (
                  <div className="grid gap-2">
                    <Label>
                      {headerFormat.charAt(0) + headerFormat.slice(1).toLowerCase()} Upload
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    
                    {headerMedia.previewUrl ? (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getHeaderIcon()}
                            <span className="text-sm font-medium truncate">{headerMedia.fileName}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeMedia}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        {headerFormat === TemplateHeaderType.IMAGE && (
                          <div className="mt-2">
                            <img 
                              src={headerMedia.previewUrl} 
                              alt="Preview" 
                              className="max-h-40 w-auto mx-auto rounded"
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
                            onClick={() => document.getElementById('media-upload')?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            {isUploading ? "Uploading..." : "Choose File"}
                          </Button>
                          <input
                            id="media-upload"
                            type="file"
                            accept={getAcceptedFileTypes()}
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {headerFormat === TemplateHeaderType.LOCATION && (
                  <div className="grid gap-2">
                    <Label>Location Header</Label>
                    <div className="border rounded-lg p-4 text-center bg-gray-50 dark:bg-gray-800">
                      <p className="text-sm text-gray-500">
                        Location will be sent dynamically when the template is used
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Body Section */}
          {templateCategory !== TemplateCategory.AUTHENTICATION && (
            <Card>
              <CardHeader>
                <CardTitle>Body (Required)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label>Message Body</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addVariableInBody}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Variable
                    </Button>
                  </div>
                  <Textarea
                    value={bodyText}
                    onChange={(e) => handleBodyTextChange(e.target.value)}
                    placeholder="Your message content here... Use {{1}}, {{2}} for variables"
                    rows={4}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Use variables like, for dynamic content. Variables must be numbered sequentially starting from 1.
                  </p>
                </div>

                {/* Dynamic Sample Value Inputs */}
                {bodyVariables.length > 0 && (
                  <div className="grid gap-2">
                    <Label>Sample Values for Preview</Label>
                    {bodyVariables.map((varNum, index) => (
                      <div key={varNum} className="flex gap-2 items-center">
                        <Label className="w-8 text-sm">{`{{${varNum}}}`}</Label>
                        <Input
                          value={bodySampleValues[index] || ""}
                          onChange={(e) => {
                            const updated = [...bodySampleValues];
                            updated[index] = e.target.value;
                            setBodySampleValues(updated);
                          }}
                          placeholder={`Enter sample value for {{${varNum}}}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Footer Section */}
          {templateCategory !== TemplateCategory.AUTHENTICATION && (
            <Card>
              <CardHeader>
                <CardTitle>Footer (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Footer Text</Label>
                  <Input
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="e.g. Thank you for choosing us!"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500">
                    {footerText.length}/60 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Buttons Section */}
          {templateCategory !== TemplateCategory.AUTHENTICATION && (
            <Card>
              <CardHeader>
                <CardTitle>Buttons (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Label>Call to Action Buttons</Label>
                {buttons.map((button, index) => {
                  const isURL = button.type === "URL";
                  button.text = button.type === TemplateButtonType.COPY_CODE ? "Copy offer code" : button.text;
                  return (
                    <div key={index} 
                    className={"border rounded-md p-3 flex gap-2 items-center justify-between"}>
                        <div className="flex-1">
                          <div className="flex gap-2 items-center">
                            <Select
                              value={button.type}
                              onValueChange={(value) => updateButton(index, "type", value)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={TemplateButtonType.QUICK_REPLY}>Quick Reply</SelectItem>
                                <SelectItem value={TemplateButtonType.URL}>URL</SelectItem>
                                <SelectItem value={TemplateButtonType.PHONE_NUMBER}>Phone Number</SelectItem>
                                <SelectItem value={TemplateButtonType.COPY_CODE}>Copy offer code</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              className="flex-1"
                              disabled={button.type === TemplateButtonType.COPY_CODE}
                              value={button.text}
                              onChange={(e) => updateButton(index, "text", e.target.value)}
                              placeholder="Button text"
                              maxLength={20}
                            />
                          </div>
                          {(button.type === TemplateButtonType.PHONE_NUMBER) && (
                            <Input
                              className="flex-1 mt-2"
                              value={(button as any).phone_number || ""}
                              onChange={(e) => updateButton(index, "phone_number", e.target.value)}
                              placeholder="+1234567890"
                            />
                          )}
                          {(button.type === TemplateButtonType.COPY_CODE) && (
                            <Input
                              className="flex-1 mt-2"
                              // value={(button as any).copy_code || ""}
                              onChange={(e) => setCopyCodeSampleValues(e.target.value)}
                              placeholder="Enter sample code"
                            />
                          )}
                          {isURL && (
                            <div className="mt-2 space-y-2">
                              <div className="flex gap-2 items-center justify-between">
                                <Input
                                  className="flex-1"
                                  value={(button as any).url || ""}
                                  onChange={(e) => updateButton(index, "url", e.target.value)}
                                  placeholder="https://..."
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isVariableAddedInButtonUrl}
                                    onClick={() => addVariableInUrlButton(index)}
                                >
                                  Add variable
                                </Button>
                              </div>
                              <div>
                                {/* Dynamic Sample Value Inputs */}
                                {isVariableAddedInButtonUrl && (
                                  <div className="grid gap-2 mt-4">
                                    <Label>Enter full url for Preview</Label>
                                      <div className="flex gap-2 items-center">
                                        <Input
                                          className="flex-1"
                                          onChange={(e) => setUrlSampleValues(e.target.value)}
                                          placeholder={`https://example.com/your-path/{{1}}`}
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => removeVariableInUrlButton(index)}
                                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                  </div>
                                )}
                                <p className="text-xs text-gray-500">
                                  Only one variable can be added to the end of a URL.
                                </p>                
                              </div>
                            </div>
                          )}
                        </div>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeButton(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={addButton}
                  disabled={buttons.length >= 3}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Button {buttons.length >= 3 && "(Max 3)"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <Button onClick={saveTemplate} disabled={isSaving} className="w-full mt-4 mb-10">
            {isSaving ? (isEdit ? "Updating Template..." : "Creating Template...") : (isEdit ? "Update Template" : "Create Template")}
          </Button>
        </div>

        {/* Right Section - WhatsApp Preview */}
        <div className="flex-3 w-full md:w-[360px] self-start sticky top-10">
          <MessagePreviewPage messages={[fullMessage]} />
        </div>
      </div>
    </div>
  );
}