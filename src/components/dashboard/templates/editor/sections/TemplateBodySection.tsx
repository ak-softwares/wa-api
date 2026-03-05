import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface Props {
  bodyText: string;
  handleBodyTextChange: (value: string) => void;
  addVariableInBody: () => void;
  bodyVariables: number[];
  bodySampleValues: string[];
  setBodySampleValues: (value: string[]) => void;
}

export function TemplateBodySection({ bodyText, handleBodyTextChange, addVariableInBody, bodyVariables, bodySampleValues, setBodySampleValues }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Body (Required)</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label>Message Body</Label>
            <Button type="button" variant="outline" size="sm" onClick={addVariableInBody} className="flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Variable
            </Button>
          </div>
          <Textarea value={bodyText} onChange={(e) => handleBodyTextChange(e.target.value)} rows={4} required />
        </div>

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
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
