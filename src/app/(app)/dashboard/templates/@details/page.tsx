"use client";

import CreateTemplatePage from "@/components/dashboard/templates/CreateTemplatePage";
import TemplateDetailsDefaultPage from "@/components/dashboard/templates/TemplateDefaultPage";
import { useTemplateStore } from "@/store/templateStore";

export default function AiDetailPage() {
  const { selectedTemplateMenu } = useTemplateStore();

  if(selectedTemplateMenu == "create-template"){
    return <CreateTemplatePage />
  } else{
    return <TemplateDetailsDefaultPage />
  }
}
