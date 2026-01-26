"use client";

import IconButton from "@/components/common/IconButton";
import APITokenSection from "./ApiTokenSection";
import { useAiStore } from "@/store/aiStore";

export default function APITokenPage() {
  const { setSelectedAiMenu } = useAiStore();

  const handleBack = () => {
    setSelectedAiMenu(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={handleBack}
            label="Back"
            IconSrc="/assets/icons/arrow-left.svg"
          />
          <h1 className="text-xl font-semibold">API Token Management</h1>
        </div>
      </div>

      {/* Content Centered */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="max-w-xl w-full">
          <APITokenSection />
        </div>
      </div>
    </div>
  );
}
