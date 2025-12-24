"use client";

import { useEffect, useState } from "react";
import { Copy, Info, Trash2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";

export default function APITokenSection() {
  const [config, setConfig] = useState({ apiToken: "" });
  const [isLoading, setIsLoading] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  const loadApiToken = async () => {
    setIsLoading(true);
    const res = await fetch("/api/whatsapp/api-token");
    if (res.ok) {
      const { data } = await res.json();
      setConfig({ apiToken: data?.token || "" });
    }
    setIsLoading(false);
  };

  const generateNewToken = async () => {
    const res = await fetch("/api/whatsapp/api-token", { method: "POST" });
    if (res.ok) {
      const { data } = await res.json();
      setConfig({ apiToken: data.token });
      toast.success("New API token generated!");
    } else {
      toast.error("Failed to generate token");
    }
  };

  const revokeToken = async () => {
    const res = await fetch("/api/whatsapp/api-token", { method: "DELETE" });
    if (res.ok) {
      setConfig({ apiToken: "" });
      toast.success("API token revoked");
    } else {
      toast.error("Failed to revoke token");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  useEffect(() => {
    loadApiToken();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a884]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a1b1b] p-5 rounded-xl shadow-sm border border-gray-200 dark:border-[#2a2b2b]">
        <Tabs defaultValue="token" className="w-full">
            <TabsList className="grid grid-cols-2 w-full bg-gray-100 dark:bg-[#2a2b2b]">
            <TabsTrigger 
                value="token"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-[#161717] dark:data-[state=active]:text-white"
            >
                Token
            </TabsTrigger>
            <TabsTrigger 
                value="usage"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-[#161717] dark:data-[state=active]:text-white"
            >
                Usage
            </TabsTrigger>
            </TabsList>

            {/* Token Tab */}
            <TabsContent value="token" className="pt-4 space-y-5">
            <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">Your API Token</Label>
                <div className="flex gap-2">
                <Input
                    readOnly
                    value={config.apiToken}
                    placeholder="Click generate to create a token"
                    className="bg-white dark:bg-[#2E2F2F] border-gray-200 dark:border-[#3a3b3b] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                <Button
                    variant="outline"
                    size="icon"
                    disabled={!config.apiToken}
                    onClick={() => copyToClipboard(config.apiToken)}
                    className="bg-white dark:bg-[#2E2F2F] border-gray-200 dark:border-[#3a3b3b] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3a3b3b]"
                >
                    <Copy className="h-4 w-4" />
                </Button>
                <Button
                    variant="destructive"
                    size="icon"
                    disabled={!config.apiToken}
                    onClick={revokeToken}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
                </div>
            </div>

            <Button
                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-[#2E2F2F] border-gray-200 dark:border-[#3a3b3b] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3a3b3b]"
                variant="outline"
                onClick={generateNewToken}
            >
                <RefreshCcw className="h-4 w-4" />
                Generate New Token
            </Button>
            </TabsContent>

            {/* Usage Tab */}
            <TabsContent value="usage" className="pt-4 space-y-4">
            <div className="text-sm text-muted-foreground dark:text-gray-400 space-y-3">
                <p className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <Info className="h-4 w-4" />
                Example: n8n HTTP Request Node
                </p>
                <div className="bg-gray-100 dark:bg-[#2E2F2F] p-4 rounded-lg font-mono text-xs space-y-2 text-gray-900 dark:text-gray-300">
                <p><strong>Method:</strong> POST</p>
                <p><strong>URL:</strong> {`${baseUrl}/api/whatsapp/messages`}</p>
                <p className="text-xs break-words whitespace-pre-wrap"><strong>Authorization:</strong> Bearer YOUR_TOKEN</p>
                <p><strong>Content-Type:</strong> application/json</p>
                <pre className="bg-white dark:bg-[#1a1b1b] p-2 rounded-md text-gray-900 dark:text-gray-300">
    {`{
  "participants": [{"number":"918265XXXXXXX"}],
  "messageType": "text", // media, template, location
  "message": "Hello from Postman!"
}`}
                </pre>
                </div>
            </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}