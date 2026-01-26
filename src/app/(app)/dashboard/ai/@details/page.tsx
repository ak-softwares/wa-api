"use client";

import AIChatPage from "@/components/dashboard/ai/pages/AiChatPage";
import DefaultAiPage from "@/components/dashboard/ai/pages/DefaultAIPage";
import APITokenPage from "@/components/dashboard/ai/pages/APITokenPage";
import ToolsIntegrationPage from "@/components/dashboard/tools/pages/ToolsIntegrationPage";
import { useAiStore } from "@/store/aiStore";

export default function AiDetailPage() {
  const { selectedAiMenu } = useAiStore();

  if(selectedAiMenu == "ai-chat"){
    return <AIChatPage />
  } else if(selectedAiMenu == "tools"){
    return <ToolsIntegrationPage />
  } else if(selectedAiMenu == "api-key"){
    return <APITokenPage />
  } else{
    return <DefaultAiPage />
  }
}
