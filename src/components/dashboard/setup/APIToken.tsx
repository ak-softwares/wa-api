import { useEffect, useState } from "react";
import { Key, Copy, Info, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";

export default function APIToken() {
  const [config, setConfig] = useState({ apiToken: "" });

  const loadApiToken = async () => {
    const res = await fetch("/api/api-token");
    if (res.ok) {
      const { data } = await res.json();
      setConfig({ apiToken: data?.token || "" });
    }
  };

  const generateNewToken = async () => {
    const res = await fetch("/api/api-token", { method: "POST" });
    if (res.ok) {
      const { data } = await res.json();
      setConfig({ apiToken: data.token });
      toast.success("New API token generated!");
    }
  };

  const revokeToken = async () => {
    const res = await fetch("/api/api-token", { method: "DELETE" });
    if (res.ok) {
      setConfig({ apiToken: "" });
      toast.success("API token revoked");
    } else {
      toast.error("Failed to revoke token");
    }
  };

  useEffect(() => {
    loadApiToken();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Copied"))
      .catch(() => toast.error("Failed"));
  };
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          AI Agent API
        </CardTitle>
        <CardDescription>Manage token & see usage instructions</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="token" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="token">Token</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="token" className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label>Your API Token</Label>
              <div className="flex gap-2">
                <Input readOnly value={config.apiToken} placeholder="Click generate" />
                
                {/* Copy */}
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!config.apiToken}
                  onClick={() => copyToClipboard(config.apiToken)}
                >
                  <Copy className="h-4 w-4" />
                </Button>

                {/* Delete */}
                <Button
                  variant="destructive"
                  size="icon"
                  disabled={!config.apiToken}
                  onClick={revokeToken}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button className="w-full" variant="outline" onClick={generateNewToken}>
              Generate New Token
            </Button>
          </TabsContent>

          <TabsContent value="usage" className="pt-4">
            <div className="text-sm space-y-3 text-muted-foreground">
              <p className="font-semibold flex items-center gap-2"><Info className="h-4 w-4" />n8n HTTP Request</p>
              <div className="bg-muted p-3 rounded-md font-mono text-xs space-y-1">
                <p>Method: POST</p>
                <p>URL: {`${baseUrl}/api/send-message`}</p>
                <p>Authorization: Bearer {config.apiToken || "YOUR_TOKEN"}</p>
                <p>Content-Type: application/json</p>
                <pre>
{`{
  "to": "1234567890",
  "message": "Your response message"
}`}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
