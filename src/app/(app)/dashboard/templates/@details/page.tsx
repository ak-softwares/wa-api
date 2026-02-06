"use client";

import CreateTemplatePage from "@/components/dashboard/templates/pages/CreateTemplatePage";
import TemplateDetailsDefaultPage from "@/components/dashboard/templates/pages/TemplateDefaultPage";
import { useTemplateStore } from "@/store/templateStore";

export default function AiDetailPage() {
  const { selectedTemplateMenu } = useTemplateStore();

  if(selectedTemplateMenu == "create-template"){
    return <CreateTemplatePage />
  } else{
    return <TemplateDetailsDefaultPage />
  }
}
