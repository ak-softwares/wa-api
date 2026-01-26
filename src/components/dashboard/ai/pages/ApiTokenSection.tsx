"use client";

import { Copy, Info, Trash2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useApiToken } from "@/hooks/api/useApiToken";
import APITokenSkeleton from "../skeletons/APITokenSkeleton";

export default function APITokenSection() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  const {
    apiToken,
    isLoading,
    generateNewToken,
    revokeToken,
    copyToClipboard,
  } = useApiToken(true);

  if (isLoading) {
    return <APITokenSkeleton />;
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
                value={apiToken}
                placeholder="Click generate to create a token"
                className="bg-white dark:bg-[#2E2F2F] border-gray-200 dark:border-[#3a3b3b] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />

              <Button
                variant="outline"
                size="icon"
                disabled={!apiToken}
                onClick={() => copyToClipboard(apiToken)}
                className="bg-white dark:bg-[#2E2F2F] border-gray-200 dark:border-[#3a3b3b] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3a3b3b]"
              >
                <Copy className="h-4 w-4" />
              </Button>

              <Button
                variant="destructive"
                size="icon"
                disabled={!apiToken}
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
              <p><strong>URL:</strong> {`${baseUrl}/api/wa-accounts/messages`}</p>
              <p className="text-xs break-words whitespace-pre-wrap">
                <strong>Authorization:</strong> Bearer YOUR_TOKEN
              </p>
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
