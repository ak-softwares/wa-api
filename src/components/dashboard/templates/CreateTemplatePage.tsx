"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Info, Plus, X } from "lucide-react";
import { TemplateBodyComponent, TemplateButton, TemplateButtonsComponent, TemplateComponent, TemplateFooterComponent, TemplateHeaderComponent } from "@/types/Template";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import IconButton from "@/components/common/IconButton";
import { useTemplateStore } from "@/store/templateStore";

export default function CreateTemplatePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState<"UTILITY" | "MARKETING" | "AUTHENTICATION">("UTILITY");
  const [templateLanguage, setTemplateLanguage] = useState("en");
  const [headerFormat, setHeaderFormat] = useState<"TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT">("TEXT");
  const [headerText, setHeaderText] = useState("");
  const [bodyText, setBodyText] = useState("Your order #{{1}} has been shipped.");
  const [footerText, setFooterText] = useState("");
  const { duplicateTemplateData, setDuplicateTemplateData, setSelectedTemplateMenu } = useTemplateStore();
  const [buttons, setButtons] = useState<TemplateButton[]>([
    { type: "QUICK_REPLY", text: "" }
  ]);

  useEffect(() => {
    if (duplicateTemplateData) {
      // Duplicate basic fields
      setTemplateName(duplicateTemplateData.name + "_copy");
      setTemplateCategory(duplicateTemplateData.category as "UTILITY" | "MARKETING" | "AUTHENTICATION");
      setTemplateLanguage(duplicateTemplateData.language || "en");

      // Reset header, footer, body, and buttons based on components
      const headerComp = duplicateTemplateData.components.find(c => c.type === "HEADER") as TemplateHeaderComponent | undefined;
      const bodyComp = duplicateTemplateData.components.find(c => c.type === "BODY") as TemplateBodyComponent | undefined;
      const footerComp = duplicateTemplateData.components.find(c => c.type === "FOOTER") as TemplateFooterComponent | undefined;
      const buttonsComp = duplicateTemplateData.components.find(c => c.type === "BUTTONS") as TemplateButtonsComponent | undefined;

      setHeaderFormat(headerComp?.format || "TEXT");
      setHeaderText(headerComp?.text || "");
      setBodyText(bodyComp?.text || "");
      setFooterText(footerComp?.text || "");
      setButtons(buttonsComp?.buttons?.map(btn => ({ ...btn })) || [{ type: "QUICK_REPLY", text: "" }]);

      // Optionally clear duplicateTemplateData after loading
      setDuplicateTemplateData(null);
    }
  }, [duplicateTemplateData, setDuplicateTemplateData]);

  const router = useRouter();

  // Sample values for body text variables
  const [sampleValues, setSampleValues] = useState(["Akash"]);

  const saveTemplate = async () => {
    try {
      setIsSaving(true);
      // Build components array according to the API model
      const components: TemplateComponent[] = [];

      // Add HEADER component if header text is provided
      if (headerText.trim()) {
        components.push({
          type: "HEADER",
          format: headerFormat,
          text: headerFormat,
        });
      }

      // Add BODY component (required)
      if (bodyText.trim()) {
        components.push({
          type: "BODY",
          text: bodyText,
          example: {
            body_text: [sampleValues],
          }
        });
      }

      // Add FOOTER component if footer text is provided
      if (footerText.trim()) {
        components.push({
          type: "FOOTER",
          text: footerText,
        });
      }

      // Add BUTTONS component if buttons are provided
      const validButtons = buttons.filter(btn => btn.text.trim());
      if (validButtons.length > 0) {
        components.push({
          type: "BUTTONS",
          buttons: validButtons,
        });
      }

      const templateData = {
        name: templateName,
        category: templateCategory,
        language: templateLanguage,
        components,
      };

      const res = await fetch("/api/whatsapp/template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Template created successfully")
        // Reset form or redirect
        setSelectedTemplateMenu(null);
        router.refresh();
      } else {
        toast.error("Something went wrong " + data.message)
      }
    } catch (error) {
      toast.error("Something went wrong " + error)
    } finally {
      setIsSaving(false);
    }
  };

  // Extract variables from body text
  const extractVariables = (text: string) => {
    const regex = /{{(\d+)}}/g;
    const matches = [...text.matchAll(regex)];
    return matches.map(match => parseInt(match[1])).sort((a, b) => a - b);
  };

  const variables = extractVariables(bodyText);

  // Update sample values when variables change
  const updateSampleValues = (newVariables: number[]) => {
    const newSampleValues = [...sampleValues];
    
    if (newSampleValues.length > newVariables.length) {
      newSampleValues.splice(newVariables.length);
    }
    
    while (newSampleValues.length < newVariables.length) {
      newSampleValues.push(`Sample ${newSampleValues.length + 1}`);
    }
    
    setSampleValues(newSampleValues);
  };

  // Handle body text change
  const handleBodyTextChange = (value: string) => {
    setBodyText(value);
    const newVariables = extractVariables(value);
    updateSampleValues(newVariables);
  };

  // Add variable to body text
  const addVariable = () => {
    const nextVarNumber = variables.length > 0 ? Math.max(...variables) + 1 : 1;
    const newBodyText = `${bodyText} {{${nextVarNumber}}}`;
    setBodyText(newBodyText);
    updateSampleValues([...variables, nextVarNumber]);
  };

  // Button management
  const addButton = () => {
    if (buttons.length < 3) { // WhatsApp allows max 3 buttons
      setButtons([...buttons, { type: "QUICK_REPLY", text: "" }]);
    }
  };

  const updateButton = (index: number, field: string, value: string) => {
    const updatedButtons = [...buttons];
    
    if (field === "type") {
      // Reset button data when type changes
      updatedButtons[index] = {
        type: value as "URL" | "QUICK_REPLY" | "PHONE_NUMBER",
        text: updatedButtons[index].text,
        ...(value === "URL" ? { url: "" } : 
            value === "PHONE_NUMBER" ? { phone_number: "" } : {})
      } as TemplateButton;
    } else {
      updatedButtons[index] = {
        ...updatedButtons[index],
        [field]: value
      };
    }
    
    setButtons(updatedButtons);
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  // Render preview message with sample values
  const renderPreviewMessage = () => {
    let preview = bodyText;
    
    variables.forEach((varNum, index) => {
      const sampleValue = sampleValues[index] || `Sample ${varNum}`;
      preview = preview.replace(new RegExp(`{{${varNum}}}`, 'g'), sampleValue);
    });
    
    return preview;
  };

  // Render preview based on header format
  const renderPreview = () => {
    return (
      <div className="space-y-3">
        {/* Header Preview */}
        {headerText && (
          <div className="text-center font-semibold text-sm border-b pb-2">
            {headerFormat === "TEXT" ? (
              headerText
            ) : (
              <div className="bg-gray-200 dark:bg-gray-600 h-16 rounded flex items-center justify-center">
                <span className="text-gray-500">
                  {headerFormat.charAt(0) + headerFormat.slice(1).toLowerCase()} Header
                </span>
              </div>
            )}
          </div>
        )}

        {/* Body Preview */}
        <div className="flex items-start gap-2">
          <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm text-sm max-w-[80%]">
            {renderPreviewMessage()}
          </div>
        </div>

        {/* Footer Preview */}
        {footerText && (
          <p className="text-xs text-gray-500 mt-2">{footerText}</p>
        )}

        {/* Buttons Preview */}
        {buttons.some(btn => btn.text.trim()) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {buttons
              .filter(btn => btn.text.trim())
              .map((btn, i) => (
                <Button key={i} size="sm" variant="outline" className="rounded-full text-xs">
                  {btn.text}
                </Button>
              ))}
          </div>
        )}
      </div>
    );
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
          <h1 className="text-xl font-semibold">Add Template</h1>
        </div>
      </div>

      <div className="min-h-screen flex flex-col md:flex-row gap-6 p-6">
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
                <Select value={templateCategory} onValueChange={(value: "UTILITY" | "MARKETING" | "AUTHENTICATION") => setTemplateCategory(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTILITY">Utility</SelectItem>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
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
                    onChange={(e) => setTemplateName(e.target.value)}
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
          <Card>
            <CardHeader>
              <CardTitle>Header (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Header Format</Label>
                <Select value={headerFormat} onValueChange={(value: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT") => setHeaderFormat(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXT">Text</SelectItem>
                    <SelectItem value="IMAGE">Image</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                    <SelectItem value="DOCUMENT">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {headerFormat === "TEXT" && (
                <div className="grid gap-2">
                  <Label>Header Text</Label>
                  <Input
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    placeholder="Enter header text"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500">
                    {headerText.length}/60 characters
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Body Section */}
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
                    onClick={addVariable}
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
                  Use variables like {`${1}`}, {`${2}`} for dynamic content. Variables must be numbered sequentially starting from 1.
                </p>
              </div>

              {/* Dynamic Sample Value Inputs */}
              {variables.length > 0 && (
                <div className="grid gap-2">
                  <Label>Sample Values for Preview</Label>
                  {variables.map((varNum, index) => (
                    <div key={varNum} className="flex gap-2 items-center">
                      <Label className="w-8 text-sm">{`${varNum}`}</Label>
                      <Input
                        value={sampleValues[index] || ""}
                        onChange={(e) => {
                          const updated = [...sampleValues];
                          updated[index] = e.target.value;
                          setSampleValues(updated);
                        }}
                        placeholder={`Enter sample value for {{${varNum}}}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer Section */}
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

          {/* Buttons Section */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Label>Call to Action Buttons</Label>
              {buttons.map((button, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Select
                    value={button.type}
                    onValueChange={(value) => updateButton(index, "type", value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUICK_REPLY">Quick Reply</SelectItem>
                      <SelectItem value="URL">URL</SelectItem>
                      <SelectItem value="PHONE_NUMBER">Phone Number</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    className="flex-1"
                    value={button.text}
                    onChange={(e) => updateButton(index, "text", e.target.value)}
                    placeholder="Button text"
                    maxLength={20}
                  />

                  {(button.type === "URL" || button.type === "PHONE_NUMBER") && (
                    <Input
                      className="flex-1"
                      value={button.type === "URL" ? (button as any).url || "" : (button as any).phone_number || ""}
                      onChange={(e) => updateButton(index, button.type === "URL" ? "url" : "phone_number", e.target.value)}
                      placeholder={button.type === "URL" ? "https://..." : "+1234567890"}
                    />
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeButton(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

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

          {/* Submit */}
          <Button onClick={saveTemplate} disabled={isSaving} className="w-full mt-4 mb-10">
            {isSaving ? "Creating Template..." : "Create Template"}
          </Button>
        </div>

        {/* Right Section - WhatsApp Preview */}
        <div className="flex-3 w-full md:w-[360px]">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>WhatsApp Preview</CardTitle>
            </CardHeader>
            <CardContent className="bg-[#e9f5ec] dark:bg-gray-700 rounded-lg p-4 m-4 min-h-[200px]">
              {renderPreview()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

  );
}
