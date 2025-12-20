// app/ai-agent/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Power, Save, Link, Zap, ShieldCheck, Info } from 'lucide-react';
import { IAIAgent } from '@/types/AIAgent';
import IconButton from '@/components/common/IconButton';
import { useAiStore } from '@/store/aiStore';
import APITokenSection from '../settings/ApiTokenSection';
import { Textarea } from '@/components/ui/textarea';

export default function AIAgentPage() {
  const [aiAgent, setAiAgent] = useState<IAIAgent>({
    webhookUrl: '',
    isActive: false,
    prompt: '',     // ✅ added
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { setSelectedAiMenu } = useAiStore();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/whatsapp/ai/ai-agent');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setAiAgent(data.data);
        }
      }
    } catch (err) {
      toast.error(`Error loading config: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (aiAgent.webhookUrl && !isValidUrl(aiAgent.webhookUrl)) {
      toast.error('Please enter a valid webhook URL');
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch('/api/whatsapp/ai/ai-agent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiAgent),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAiAgent(data.data);
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
    if (!aiAgent.isActive && (!aiAgent.webhookUrl || !isValidUrl(aiAgent.webhookUrl))) {
      toast.error('Please set a valid webhook URL before activating the agent');
      return;
    }

    const newStatus = !aiAgent.isActive;
    try {
      setIsSaving(true);
      const res = await fetch('/api/whatsapp/ai/ai-agent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...aiAgent, isActive: newStatus, prompt: aiAgent.prompt}),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAiAgent(data.data);
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
    const webhookUrl = aiAgent?.webhookUrl?.trim() || '';

    if (!webhookUrl) {
      toast.error('Webhook URL is required');
      return;
    }

    try {
      setIsTesting(true);
      const res = await fetch('/api/whatsapp/ai/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl }),
      });
      const result = await res.json();

      if (result?.success) {
        toast.success(result.message || 'Webhook test successful');
      } else {
        toast.error(result.message || 'Webhook test failed');
      }
    } catch (err: any) {
      toast.error(`Error testing webhook: ${err?.message || err}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleBack = () => {
    setSelectedAiMenu(null);
  };

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a884]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={handleBack}
            label="Back"
            IconSrc="/assets/icons/arrow-left.svg"
          />
          <div>
            <h1 className="text-xl font-semibold">AI Agent</h1>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-2 flex flex-col">
          <div className="px-6 overflow-y-auto mb-8">
            <div className="max-w-4xl mx-auto">
              
              {/* Prompt Input */}
              <div className="mb-6">
                <Label htmlFor="ai-agent-prompt" className="text-sm mb-2 block text-gray-900 dark:text-white">
                  System Prompt
                </Label>
                <div className="relative">
                  <Textarea
                    id="ai-agent-prompt"
                    placeholder="You are an automation agent. Follow webhook instructions..."
                    value={aiAgent.prompt}
                    onChange={(e) =>
                      setAiAgent((prev) => ({
                        ...prev,
                        prompt: e.target.value
                      }))
                    }
                    rows={12}
                    className="font-mono text-sm border-2 border-gray-300 dark:border-[#3a3b3b] rounded-lg 
                    focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] bg-white dark:bg-[#2E2F2F] 
                    text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />

                  {/* Character Counter */}
                  <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400 
                  bg-white dark:bg-[#2E2F2F] px-2 py-1 rounded border border-gray-200 dark:border-[#3a3b3b]">
                    {aiAgent.prompt?.length} characters
                  </div>
                </div>
              </div>

              {/* Webhook Input */}
              <div className="mb-6">
                <Label htmlFor="webhookUrl" className="text-sm mb-2 block text-gray-900 dark:text-white">
                  Webhook URL
                </Label>
                <div className="relative">
                  <Input
                    id="webhookUrl"
                    type="url"
                    placeholder="https://n8n.example.com/webhook/123"
                    value={aiAgent.webhookUrl || ''}
                    onChange={(e) =>
                      setAiAgent((prev) => ({ ...prev, webhookUrl: e.target.value }))
                    }
                    className="text-sm border-2 border-gray-300 dark:border-[#3a3b3b] rounded-lg focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] bg-white dark:bg-[#2E2F2F] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>
                {aiAgent.webhookUrl && !isValidUrl(aiAgent.webhookUrl) && (
                  <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || (aiAgent.webhookUrl ? !isValidUrl(aiAgent.webhookUrl) : false)}
                  className="bg-[#00a884] hover:bg-[#008f74] text-white flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Webhook'}</span>
                </Button>
                <Button
                  onClick={handleTestWebhook}
                  disabled={isTesting || !aiAgent.webhookUrl || !isValidUrl(aiAgent.webhookUrl)}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isTesting ? 'Testing...' : 'Test Webhook'}</span>
                </Button>
              </div>

            </div>
          </div>

          {/* Token Copy */}
          <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Your API Token
              </h2>
            </div>

            <APITokenSection />
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-1 flex-col px-4">
          <div className="mt-8 p-4 bg-[#f0f2f5] dark:bg-[#2E2F2F] rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 dark:text-white mb-3">AI Agent Preview</h3>
            <div className="space-y-3 text-xs text-gray-500 dark:text-gray-400">
              <p>
                {aiAgent.webhookUrl
                  ? `Webhook configured: ${aiAgent.webhookUrl}`
                  : 'No webhook configured yet.'}
              </p>
              <p>
                The agent will automatically communicate with N8N when activated.
              </p>
            </div>
          </div>

          <div className="py-4">
            <div className="bg-white dark:bg-[#2E2F2F] rounded-lg p-4 shadow-sm border border-gray-200 dark:border-[#3a3b3b]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-white">Agent Status</span>
                <Badge
                  variant={aiAgent.isActive ? 'default' : 'secondary'}
                  className={`${aiAgent.isActive ? 'bg-[#00a884]' : 'bg-gray-400'} text-white`}
                >
                  {aiAgent.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <Button
                onClick={toggleAgent}
                disabled={isSaving}
                className={`w-full ${
                  aiAgent.isActive
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-[#00a884] hover:bg-[#008f74]'
                } text-white`}
              >
                <Power className="h-4 w-4 mr-2" />
                {isSaving
                  ? 'Updating...'
                  : aiAgent.isActive
                  ? 'Deactivate Agent'
                  : 'Activate Agent'}
              </Button>
            </div>
          </div>
          
          {/* Info Section */}
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-3">Information</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Link className="h-4 w-4 text-[#00a884] mt-0.5" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Connect your AI agent with N8N using your webhook URL.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-[#00a884] mt-0.5" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Webhook must be valid and publicly accessible.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Zap className="h-4 w-4 text-[#00a884] mt-0.5" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Activation changes take effect immediately after saving.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}