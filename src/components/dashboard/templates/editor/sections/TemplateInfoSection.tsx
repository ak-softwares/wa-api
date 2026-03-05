import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TemplateCategory } from "@/utiles/enums/template";
import { Input } from "@/components/ui/input";

interface Props {
  templateCategory: TemplateCategory;
  setTemplateCategory: (value: TemplateCategory) => void;
  templateLanguage: string;
  setTemplateLanguage: (value: string) => void;
  templateName: string;
  setTemplateName: (value: string) => void;
  toMetaTemplateName: (value: string) => string;
}

export function TemplateInfoSection({
  templateCategory,
  setTemplateCategory,
  templateLanguage,
  setTemplateLanguage,
  templateName,
  setTemplateName,
  toMetaTemplateName,
}: Props) {
  return (
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
              Name can only be in lowercase alphanumeric characters and underscores. Special characters and white-space are not allowed.
              Example: app_verification_code
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
