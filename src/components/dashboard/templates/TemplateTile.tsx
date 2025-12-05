import { Calendar, FileText, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Template,
  TemplateComponent,
  TemplateHeaderComponentCreate,
} from "@/types/Template";
import TemplateMenu from "./TemplateMenu";

interface TemplateTileProps {
  template: Template;
  onDelete?: (templateName: string) => void; // FIXED
  onDuplicate?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onClick?: () => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  isActive?: boolean; // NEW: same as ContactAvatar
}

export function TemplateTile({
  template,
  onDelete,
  onClick,
  onDuplicate,
  onEdit,
  isSelected = false,
  isSelectionMode = false,
  isActive = false, // NEW
}: TemplateTileProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "default";
      case "PENDING":
        return "secondary";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getHeaderFormat = () => {
    const headerComponent = template?.components?.find(
      (c: TemplateComponent) => c.type === "HEADER"
    ) as TemplateHeaderComponentCreate | undefined;

    return headerComponent?.format || "TEXT";
  };

  return (
    <div
      onClick={onClick}
      className={`
        w-full px-3 py-4 rounded-lg flex items-center justify-between cursor-pointer select-none
        transition-colors duration-200
        ${isActive
          ? "bg-gray-200 dark:bg-[#2A2A2A]"
          : "hover:bg-gray-100 dark:hover:bg-[#2E2F2F]"
        }
        ${isActive ? "border-l-4 border-green-500 pl-[calc(0.75rem-4px)]" : ""}
      `}
    >
      {/* Left side */}
      <div className="flex items-center gap-3 flex-1 min-w-0">

        {/* Checkbox */}
        <div
          className={`
            flex items-center justify-center transition-all duration-200
            ${isSelectionMode ? "w-6" : "w-0 overflow-hidden"}
          `}
        >
          {isSelectionMode && (
            <div
              className={`
                flex items-center justify-center rounded border
                ${isSelected ? "bg-green-500 border-green-500" : "border-gray-400"}
                h-4 w-4
              `}
            >
              {isSelected && <Check className="h-3 w-3 text-white shrink-0" />}
            </div>
          )}
        </div>

        {/* Template Icon */}
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary shrink-0">
          <FileText className="h-6 w-6" />
        </div>

        {/* Template Details */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 truncate">
            <span className="font-medium text-base truncate">
              {template.name}
            </span>

            <Badge variant={getStatusVariant(template.status ?? "")} className="text-xs shrink-0">
              {template.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground truncate mt-0.5">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{template.category}</span>

            <div className="w-1 h-1 rounded-full bg-muted-foreground/70" />

            <span className="truncate">Header: {getHeaderFormat()}</span>

            {template.createdAt && (
              <>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/70" />
                <div className="flex items-center gap-1 truncate">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Menu */}
      {!isSelectionMode && (
        <TemplateMenu
          template={template}
          onDelete={() => onDelete?.(template.name)}
          onDuplicateClick={() => onDuplicate?.(template)}
          onEdit={() => onEdit?.(template)}
        />
      )}
    </div>
  );
}
