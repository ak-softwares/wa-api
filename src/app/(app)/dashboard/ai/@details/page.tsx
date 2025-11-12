"use client";

import AIAgentPage from "@/components/dashboard/ai/AiAgentPage";
import AIChatPage from "@/components/dashboard/ai/AiChatPage";
import DefaultAiPage from "@/components/dashboard/ai/DefaultAIPage";
import { useAiStore } from "@/store/aiStore";

export default function AiDetailPage() {
  const { selectedAiMenu } = useAiStore();

  if(selectedAiMenu == "ai-chat"){
    return <AIChatPage />
  } else if(selectedAiMenu == "ai-agent"){
    return <AIAgentPage />
  } else{
    return <DefaultAiPage />
  }
}
