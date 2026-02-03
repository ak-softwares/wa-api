"use client";

import { Copy, Info, Trash2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useApiToken } from "@/hooks/api/useApiToken";
import APITokenSkeleton from "../skeletons/APITokenSkeleton";
import { useState } from "react";

export default function APITokenSection() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  const {
    apiToken, // single metadata object
    isLoading,
    generateNewToken,
    revokeToken,
    copyToClipboard,
  } = useApiToken(true);

  // ✅ raw token only shown once
  const [rawToken, setRawToken] = useState<string | null>(null);

  const handleGenerateNewToken = async () => {
    const token = await generateNewToken();
    setRawToken(token);
  };

  if (isLoading) return <APITokenSkeleton />;

  return (
    <div className="bg-white dark:bg-[#1a1b1b] p-5 rounded-xl shadow-sm border border-gray-200 dark:border-[#2a2b2b]">
      <Tabs defaultValue="token" className="w-full">
        <TabsList className="grid grid-cols-2 w-full bg-gray-100 dark:bg-[#2a2b2b]">
          <TabsTrigger value="token">Token</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        {/* ================= TOKEN TAB ================= */}
        <TabsContent value="token" className="pt-4 space-y-5">

          {/* show raw token only once */}
          {rawToken && (
            <div className="space-y-2">
              <Label>New Token (copy now, won't show again)</Label>
              <div className="flex gap-2">
                <Input readOnly value={rawToken} />
                <Button
                  size="icon"
                  onClick={() => copyToClipboard(rawToken)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* existing token metadata */}
          <div className="space-y-2">
            <Label>Your API Token</Label>

            {apiToken ? (
              <div className="flex items-center justify-between gap-2 bg-gray-100 dark:bg-[#2E2F2F] rounded-lg p-3">
                <div className="text-xs">
                  <p className="font-medium">{apiToken.name || "Default"}</p>
                  <p className="text-muted-foreground">
                    Created: {new Date(apiToken.createdAt!).toLocaleString()}
                  </p>
                </div>

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => revokeToken(apiToken?._id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No token generated yet
              </p>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGenerateNewToken}
          >
            <RefreshCcw className="h-4 w-4" />
            Generate New Token
          </Button>
        </TabsContent>

        {/* ================= USAGE TAB ================= */}
        <TabsContent value="usage" className="pt-4 space-y-4">
          <div className="text-sm space-y-3">
            <p className="font-semibold flex items-center gap-2">
              <Info className="h-4 w-4" />
              Example Request
            </p>

            <div className="bg-gray-100 dark:bg-[#2E2F2F] p-4 rounded-lg font-mono text-xs space-y-2">
              <p><strong>Method:</strong> POST</p>
              <p><strong>URL:</strong> {`${baseUrl}/api/wa-accounts/messages`}</p>
              <p><strong>Authorization:</strong> Bearer YOUR_TOKEN</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
