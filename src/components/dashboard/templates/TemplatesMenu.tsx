"use client";

import GenericMenu from "@/components/common/DropDownMenu";

interface TemplatesMenuProps {
  onSelectTemplates?: () => void; // ✅ Prop for parent callback
}

export default function TemplatesMenu({ onSelectTemplates }: TemplatesMenuProps) {
  const topItems = [
    { icon: "/assets/icons/select.svg", label: "Select Templates", action: onSelectTemplates },
  ];

  return <GenericMenu topItems={topItems} />;
}
