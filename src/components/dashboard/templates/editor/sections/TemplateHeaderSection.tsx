import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Image as ImageIcon, Video, File, Plus } from "lucide-react";
import { TemplateHeaderType } from "@/utiles/enums/template";
import { UploadedTemplateMedia } from "@/hooks/template/useTemplateMediaUpload";
interface Props {
  headerFormat: TemplateHeaderType;
  setHeaderFormat: (value: TemplateHeaderType) => void;
  headerText: string;
  setHeaderText: (value: string) => void;
  addVariableInHeader: () => void;
  headerSampleValues: string;
  setHeaderSampleValues: (value: string) => void;
  headerVariables: boolean;
  headerMedia: UploadedTemplateMedia;
  onChooseMedia: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearMedia: () => void;
  isUploading: boolean;
  getAcceptedFileTypes: () => string;
}

export function TemplateHeaderSection({
  headerFormat,
  setHeaderFormat,
  headerText,
  setHeaderText,
  addVariableInHeader,
  headerSampleValues,
  setHeaderSampleValues,
  headerVariables,
  headerMedia,
  onChooseMedia,
  clearMedia,
  isUploading,
  getAcceptedFileTypes,
}: Props) {
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

  return (
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
              <Button type="button" variant="outline" size="sm" onClick={addVariableInHeader} className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Add Variable
              </Button>
            </div>
            <Input value={headerText} onChange={(e) => setHeaderText(e.target.value)} placeholder="Header text..." maxLength={60} />
            {headerVariables && (
              <Input value={headerSampleValues} onChange={(e) => setHeaderSampleValues(e.target.value)} placeholder="Header sample value" />
            )}
          </div>
        )}

        {[TemplateHeaderType.IMAGE, TemplateHeaderType.VIDEO, TemplateHeaderType.DOCUMENT].includes(headerFormat) && (
          <div className="grid gap-2">
            <Label>Header Media</Label>
            {headerMedia.previewUrl ? (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getHeaderIcon()}
                    <span className="text-sm font-medium">{headerMedia.fileName}</span>
                  </div>

                  <Button type="button" variant="ghost" size="icon" onClick={clearMedia}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {headerFormat === TemplateHeaderType.IMAGE && (
                  <div className="flex justify-center">
                    <img
                      src={headerMedia.previewUrl}
                      alt="Header preview"
                      className="max-h-40 rounded-md border object-contain"
                    />
                  </div>
                )}

                {headerFormat === TemplateHeaderType.VIDEO && (
                  <div className="flex justify-center">
                    <video
                      src={headerMedia.previewUrl}
                      controls
                      className="max-h-40 rounded-md border"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">Upload {headerFormat.toLowerCase()} for header</p>
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("media-upload")?.click()} disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Choose File"}
                </Button>
                <input id="media-upload" type="file" accept={getAcceptedFileTypes()} onChange={onChooseMedia} className="hidden" disabled={isUploading} />
              </div>
            )}
          </div>
        )}

        {headerFormat === TemplateHeaderType.LOCATION && (
          <div className="border rounded-lg p-4 text-center bg-gray-50 dark:bg-gray-800 text-sm text-gray-500">
            Location will be sent dynamically when the template is used
          </div>
        )}
      </CardContent>
    </Card>
  );
}
