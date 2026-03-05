import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TemplateButton } from "@/types/Template";
import { TemplateButtonType } from "@/utiles/enums/template";
import { Plus, Trash2, X } from "lucide-react";

interface Props {
  buttons: TemplateButton[];
  updateButton: (index: number, field: string, value: string) => void;
  removeButton: (index: number) => void;
  addButton: () => void;
  isVariableAddedInButtonUrl: boolean;
  addVariableInUrlButton: (index: number) => void;
  removeVariableInUrlButton: (index: number) => void;
  setUrlSampleValues: (value: string) => void;
  setCopyCodeSampleValues: (value: string) => void;
}

export function TemplateButtonsSection({
  buttons,
  updateButton,
  removeButton,
  addButton,
  isVariableAddedInButtonUrl,
  addVariableInUrlButton,
  removeVariableInUrlButton,
  setUrlSampleValues,
  setCopyCodeSampleValues,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Buttons (Optional)</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Label>Call to Action Buttons</Label>
        {buttons.map((button, index) => {
          const isURL = button.type === TemplateButtonType.URL;
          return (
            <div key={index} className="border rounded-md p-3 flex gap-2 items-center justify-between">
              <div className="flex-1">
                <div className="flex gap-2 items-center">
                  <Select value={button.type} onValueChange={(value) => updateButton(index, "type", value)}>
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
                    value={button.type === TemplateButtonType.COPY_CODE ? "Copy offer code" : button.text}
                    onChange={(e) => updateButton(index, "text", e.target.value)}
                    placeholder="Button text"
                    maxLength={20}
                  />
                </div>

                {button.type === TemplateButtonType.PHONE_NUMBER && (
                  <Input className="flex-1 mt-2" value={(button as any).phone_number || ""} onChange={(e) => updateButton(index, "phone_number", e.target.value)} />
                )}

                {button.type === TemplateButtonType.COPY_CODE && (
                  <Input className="flex-1 mt-2" onChange={(e) => setCopyCodeSampleValues(e.target.value)} placeholder="Enter sample code" />
                )}

                {isURL && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2 items-center justify-between">
                      <Input className="flex-1" value={(button as any).url || ""} onChange={(e) => updateButton(index, "url", e.target.value)} />
                      <Button variant="outline" size="sm" disabled={isVariableAddedInButtonUrl} onClick={() => addVariableInUrlButton(index)}>
                        Add variable
                      </Button>
                    </div>
                    {isVariableAddedInButtonUrl && (
                      <div className="flex gap-2 items-center">
                        <Input className="flex-1" onChange={(e) => setUrlSampleValues(e.target.value)} placeholder="https://example.com/path/{{1}}" />
                        <Button variant="ghost" size="icon" onClick={() => removeVariableInUrlButton(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeButton(index)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          );
        })}

        <Button variant="outline" size="sm" onClick={addButton} disabled={buttons.length >= 3} className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Button {buttons.length >= 3 && "(Max 3)"}
        </Button>
      </CardContent>
    </Card>
  );
}
