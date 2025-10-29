// app/ai-agent/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Power, Link, Save } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import APIToken from '@/components/dashboard/setup/APIToken';
import { IAIAgent } from '@/types/AIAgent';
import { testSendToAIAgent } from '@/lib/ai/webhookService';

export default function AIAgentPage() {
  const [config, setConfig] = useState<IAIAgent>({
    webhookUrl: '',
    isActive: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/ai/agent-config');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setConfig(data.data);
        }
      } else {
        throw new Error('Failed to load configuration');
      }
    } catch (err) {
      toast.error(`Error loading config: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate webhook URL before saving
    if (config.webhookUrl && !isValidUrl(config.webhookUrl)) {
      toast.error('Please enter a valid webhook URL');
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch('/api/ai/agent-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setConfig(data.data);
        toast.success('Configuration saved successfully!');
      } else {
        throw new Error(data.message || 'Failed to save configuration');
      }
    } catch (err) {
      toast.error(`Error saving config: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAgent = async () => {
    // Don't allow activation without webhook URL
    if (!config.isActive && (!config.webhookUrl || !isValidUrl(config.webhookUrl))) {
      toast.error('Please set a valid webhook URL before activating the agent');
      return;
    }

    const newStatus = !config.isActive;
    try {
      setIsSaving(true);
      const res = await fetch('/api/ai/agent-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, isActive: newStatus }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setConfig(data.data);
        toast.success(`AI Agent ${newStatus ? 'activated' : 'deactivated'}`);
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (err) {
      toast.error(`Error updating status: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    const webhookUrl = config?.webhookUrl?.trim() || "";

    if (!webhookUrl) {
      toast.error("Webhook URL is required");
      return;
    }

    try {
      setIsTesting(true);

      // Call the Next.js API route
      const res = await fetch("/api/ai/test-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl }),
      });
      const result = await res.json();

      if (result?.success) {
        toast.success(result.message || "Webhook test successful");
      } else {
        toast.error(result.message || "Webhook test failed");
      }
    } catch (err: any) {
      toast.error(`Error testing webhook: ${err?.message || err}`);
    } finally {
      setIsTesting(false);
    }
  };

  // Helper function to validate URLs
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="animate-pulse text-muted-foreground">Loading AI Agent configuration...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary rounded-lg">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Agent Configuration</h1>
            <p className="text-muted-foreground">Connect your AI agent with N8N and manage your tokens</p>
          </div>
        </div>
        <Badge
          variant={config.isActive ? "default" : "secondary"}
          className={config.isActive ? 'bg-green-500 hover:bg-green-600' : ''}
        >
          {config.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* N8N Webhook */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link className="h-5 w-5" />
                <span>N8N Webhook</span>
              </CardTitle>
              <CardDescription>Paste your N8N webhook URL to connect AI agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://n8n.example.com/webhook/123"
                  value={config.webhookUrl || ''}
                  onChange={e => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  type="url"
                />
                {config.webhookUrl && !isValidUrl(config.webhookUrl) && (
                  <p className="text-sm text-red-500">Please enter a valid URL</p>
                )}
              </div>
              {/* Buttons in a row */}
              <div className="flex space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || (config.webhookUrl ? !isValidUrl(config.webhookUrl) : false)}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Webhook'}</span>
                </Button>

                <Button
                  onClick={handleTestWebhook}
                  disabled={isSaving || !config.webhookUrl || !isValidUrl(config.webhookUrl) || isTesting}
                >
                  {isTesting ? "Testing..." : "Test Webhook"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Token Copy */}
          <APIToken />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Power className="h-5 w-5" />
                <span>AI Agent Status</span>
              </CardTitle>
              <CardDescription>Activate or deactivate AI agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={toggleAgent}
                variant={config.isActive ? 'destructive' : 'default'}
                className="w-full flex items-center space-x-2"
                disabled={isSaving || (!config.isActive && (!config.webhookUrl || !isValidUrl(config.webhookUrl)))}
              >
                <Power className="h-4 w-4" />
                <span>
                  {isSaving 
                    ? 'Updating...' 
                    : config.isActive 
                      ? 'Deactivate Agent' 
                      : 'Activate Agent'
                  }
                </span>
              </Button>
              {!config.isActive && (!config.webhookUrl || !isValidUrl(config.webhookUrl)) && (
                <p className="text-xs text-muted-foreground">
                  Set a valid webhook URL to activate the agent
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Connect your AI agent with N8N using the webhook above</p>
              <p>• Copy the permanent token for authentication</p>
              <p>• Activation changes take effect immediately</p>
              <p>• Webhook URL is required to activate the agent</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}