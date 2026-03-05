import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TemplateFooterSection({ footerText, setFooterText }: { footerText: string; setFooterText: (value: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Footer (Optional)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <Label>Footer Text</Label>
          <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} maxLength={60} placeholder="e.g. Thank you for choosing us!" />
          <p className="text-xs text-gray-500">{footerText.length}/60 characters</p>
        </div>
      </CardContent>
    </Card>
  );
}
