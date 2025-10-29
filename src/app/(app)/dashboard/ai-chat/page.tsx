// app/ai-chat/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, Power, Settings, Save } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface AIConfig {
  prompt: string;
  isActive: boolean;
}

export default function AIChatPage() {
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    prompt: '',
    isActive: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load AI configuration on component mount
  useEffect(() => {
    loadAIConfig();
  }, []);

  const loadAIConfig = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch('/api/ai/ai-config');
      if (response.ok) {
        const result = await response.json();
        setAiConfig(result.data);
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
      const response = await fetch('/api/ai/ai-config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiConfig.prompt,
          isActive: aiConfig.isActive,
        }),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setAiConfig(updatedConfig);
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
    const newStatus = !aiConfig.isActive;
    
    try {
      setIsSaving(true);
      const response = await fetch('/api/ai/ai-config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...aiConfig,
          isActive: newStatus,
        }),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setAiConfig(updatedConfig);
        toast.success('AI Chat is successfully updated')
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
    setAiConfig(prev => ({
      ...prev,
      prompt: e.target.value
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="animate-pulse">Loading AI configuration...</div>
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
            <h1 className="text-2xl font-bold">AI Chat Configuration</h1>
            <p className="text-muted-foreground">
              Configure your WhatsApp AI chatbot settings
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge 
              variant={aiConfig.isActive ? "default" : "secondary"}
              className={aiConfig.isActive ? "bg-green-500" : ""}
            >
              {aiConfig.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Prompt Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>AI Prompt Configuration</span>
              </CardTitle>
              <CardDescription>
                Set the system prompt that defines how your AI responds to WhatsApp messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className='mb-1' >
                    <Label htmlFor="ai-prompt">System Prompt</Label>
                </div>
                <Textarea
                  id="ai-prompt"
                  placeholder="You are a helpful AI assistant for our business. Respond to customer inquiries in a friendly and professional manner. Keep responses concise and helpful..."
                  value={aiConfig.prompt}
                  onChange={handlePromptChange}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {aiConfig.prompt.length} characters
                </div>
                <Button 
                  onClick={handleSaveConfig} 
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Prompt'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Sidebar - Controls */}
        <div className="space-y-6">
          {/* AI Status Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Power className="h-5 w-5" />
                <span>AI Status</span>
              </CardTitle>
              <CardDescription>
                Activate or deactivate AI responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={toggleAIChat}
                variant={aiConfig.isActive ? "destructive" : "default"}
                className="w-full flex items-center space-x-2"
                disabled={isSaving}
              >
                <Power className="h-4 w-4" />
                <span>
                  {isSaving 
                    ? 'Updating...' 
                    : aiConfig.isActive 
                      ? 'Deactivate AI' 
                      : 'Activate AI'
                  }
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* Information */}
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                • AI will automatically respond to incoming WhatsApp messages
              </p>
              <p>
                • Make sure your prompt clearly defines your business context
              </p>
              <p>
                • Changes take effect immediately after saving
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}