"use client";

import GenericMenu from "@/components/common/DropDownMenu";
import { Template } from "@/types/Template";

interface TemplateMenuProps {
  template: Template
  onEdit?: (template: Template) => void;
  onDuplicateClick?: (template: Template) => void;
  onDelete?: (templateName: string) => void; // FIXED
}

export default function TemplateMenu({ template, onEdit, onDelete, onDuplicateClick }: TemplateMenuProps) {

  
  const topItems = [
    { icon: "/assets/icons/edit.svg", label: "Edit Template", action: () => onEdit?.(template) },
    { icon: "/assets/icons/copy.svg", label: "Duplicate Template", action: () => onDuplicateClick?.(template) },
  ];

  const bottomItems = [
    { icon: "/assets/icons/delete.svg", label: "Delete Template", action: () => onDelete?.(template.name), danger: true },
  ];

  return <GenericMenu topItems={topItems} bottomItems={bottomItems} />;
}
