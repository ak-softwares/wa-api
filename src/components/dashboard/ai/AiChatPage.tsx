// app/ai-chat/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Power, Settings, Save, MessageCircle, Zap } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { AIChat } from '@/types/AIChat';
import IconButton from '@/components/common/IconButton';
import { useRouter } from 'next/navigation';
import { useAiStore } from '@/store/aiStore';

export default function AIChatPage() {
  const router = useRouter();
  const [aiChat, setAiChat] = useState<AIChat>({
    prompt: '',
    isActive: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { setSelectedAiMenu } = useAiStore();

  // Load AI configuration on component mount
  useEffect(() => {
    loadAIConfig();
  }, []);

  const loadAIConfig = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch('/api/wa-accounts/ai/ai-chat');
      if (response.ok) {
        const result = await response.json();
        setAiChat(result.data);
      }
    } catch (error) {
      toast.error(`Error: ${error}`)
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/wa-accounts/ai/ai-chat', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiChat.prompt,
          isActive: aiChat.isActive,
        }),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setAiChat(updatedConfig);
        // Show success message
        toast.success('AI configuration saved successfully!');
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      toast.error(`Error saving AI config:${error}`)
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAIChat = async () => {
    const newStatus = !aiChat.isActive;
    
    try {
      setIsSaving(true);
      const response = await fetch('/api/wa-accounts/ai/ai-chat', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...aiChat,
          isActive: newStatus,
        }),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setAiChat(updatedConfig);
        toast.success(`AI Chat ${newStatus ? 'activated' : 'deactivated'}`)
      } else {
        throw new Error('Failed to update AI status');
      }
    } catch (error) {
        toast.error(`Error saving AI config:${error}`)  
    } finally {
      setIsSaving(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAiChat(prev => ({
      ...prev,
      prompt: e.target.value
    }));
  };

  const handleBack = () => {
    setSelectedAiMenu(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a884]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#161717]">
      {/* Header */}
      <div className="p-5 flex items-center justify-between bg-white dark:bg-[#161717]">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={handleBack}
            label="Back"
            IconSrc="/assets/icons/arrow-left.svg"
          />
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">AI Chat</h1>
          </div>
        </div>
      </div>

      <div className='flex flex-1'>            
        {/* Main Content Area - Similar to WhatsApp chat area */}
        <div className="flex-2 flex flex-col">

          {/* Prompt Configuration Area */}
          <div className="px-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Prompt Input Area */}
              <div className="mb-6">
                <Label htmlFor="ai-prompt" className="text-sm mb-2 block text-gray-900 dark:text-white">
                  System Prompt
                </Label>
                <div className="relative">
                  <Textarea
                    id="ai-prompt"
                    placeholder="You are a helpful AI assistant for our business. Respond to customer inquiries in a friendly and professional manner. Keep responses concise and helpful..."
                    value={aiChat.prompt}
                    onChange={handlePromptChange}
                    rows={14}
                    className="font-mono text-sm border-2 border-gray-300 dark:border-[#3a3b3b] rounded-lg focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] resize-none bg-white dark:bg-[#2E2F2F] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-[#2E2F2F] px-2 py-1 rounded border border-gray-200 dark:border-[#3a3b3b]">
                    {aiChat.prompt?.length} characters
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveConfig} 
                  disabled={isSaving}
                  className="bg-[#00a884] hover:bg-[#008f74] text-white flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Prompt'}</span>
                </Button>
              </div>

            </div>
          </div>
          
          {/* Information Section */}
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-3">Information</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MessageCircle className="h-4 w-4 text-[#00a884] mt-0.5" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AI will automatically respond to incoming WhatsApp messages
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Settings className="h-4 w-4 text-[#00a884] mt-0.5" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Make sure your prompt clearly defines your business context
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Zap className="h-4 w-4 text-[#00a884] mt-0.5" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Changes take effect immediately after saving
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Similar to WhatsApp sidebar */}
        <div className="flex flex-1 flex-col px-4">
          {/* Preview Section */}
          <div className="mt-8 p-4 bg-[#f0f2f5] dark:bg-[#2E2F2F] rounded-lg border border-gray-200 dark:border-[#3a3b3b]">
            <h3 className="text-sm font-medium text-gray-700 dark:text-white mb-3">Preview</h3>
            <div className="space-y-3">
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#2E2F2F] rounded-lg p-3 max-w-xs shadow-sm border border-gray-200 dark:border-[#3a3b3b]">
                  <p className="text-sm text-gray-800 dark:text-gray-200">Hello, I have a question about your services</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">10:30 AM</span>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-[#d9fdd3] dark:bg-[#144D37] rounded-lg p-3 max-w-xs shadow-sm border border-gray-200 dark:border-[#3a3b3b]">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {aiChat.prompt ? 'AI response based on your prompt...' : 'Configure your prompt to see AI responses here'}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">10:31 AM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="py-4">
            <div className="bg-white dark:bg-[#2E2F2F] rounded-lg p-4 shadow-sm border border-gray-200 dark:border-[#3a3b3b]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-white">AI Status</span>
                <Badge 
                  variant={aiChat.isActive ? "default" : "secondary"}
                  className={`${aiChat.isActive ? 'bg-[#00a884]' : 'bg-gray-400'} text-white`}
                >
                  {aiChat.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <Button
                onClick={toggleAIChat}
                className={`w-full ${
                  aiChat.isActive 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-[#00a884] hover:bg-[#008f74]'
                } text-white`}
                disabled={isSaving}
              >
                <Power className="h-4 w-4 mr-2" />
                {isSaving 
                  ? 'Updating...' 
                  : aiChat.isActive 
                    ? 'Deactivate AI' 
                    : 'Activate AI'
                }
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}