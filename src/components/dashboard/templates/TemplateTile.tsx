import { Calendar, FileText, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Template, TemplateComponent, TemplateHeaderComponent } from "@/types/Template";
import IconButton from "@/components/common/IconButton";

interface TemplateTileProps {
  template: Template;
  onDelete?: (templateName: string) => void;
  onEdit?: (templateId: string) => void;
  onClick?: () => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
}

export function TemplateTile({
  template,
  onDelete,
  onEdit,
  onClick,
  isSelected = false,
  isSelectionMode = false,
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
    const headerComponent = template.components.find(
      (c: TemplateComponent) => c.type === "HEADER"
    ) as TemplateHeaderComponent | undefined;
    return headerComponent?.format || "TEXT";
  };

  return (
    <div
      onClick={onClick}
      className={`w-full px-2 py-4 rounded-lg flex items-center justify-between transition-colors 
        hover:bg-gray-100 dark:hover:bg-[#2E2F2F] cursor-pointer select-none
        ${isSelected ? "bg-gray-100 dark:bg-[#2E2F2F]" : ""}
      `}
    >
      {/* Left Group: Selection Checkbox + Icon + Info */}
      <div className="flex items-center flex-1 min-w-0 gap-3">
        {/* Selection Checkbox */}
        <div
          className={`flex items-center justify-center transition-all duration-200 
            ${isSelectionMode ? "w-6" : "w-0 overflow-hidden"}
          `}
        >
          {isSelectionMode && (
            <div
              className={`flex items-center justify-center rounded border
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
          {getCategoryIcon(template.category)}
        </div>

        {/* Template Info */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 truncate">
            <span className="font-medium text-base truncate">{template.name}</span>
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

      {/* Right: Dropdown menu */}
      {!isSelectionMode && (
        <div className="flex items-center justify-end shrink-0 ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <IconButton
                    asChild
                    label="Chat Menu"
                    IconSrc="/assets/icons/more-vertical.svg"
                    tooltipSide="bottom"
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(template.id)}>
                  Edit Template
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(template.name)}
                  className="text-destructive"
                >
                  Delete Template
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

function getCategoryIcon(category: string) {
  return <FileText className="w-5 h-5" />;
}
