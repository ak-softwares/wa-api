import { Badge } from "@/components/ui/badge";
import { User2, Users2, Check } from "lucide-react";

interface ContactAvatarProps {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  tags?: string[]; // ✅ NEW
  onTagClick?: (tag: string) => void; // ✅ NEW
  isGroup?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  isActive?: boolean; // ✅ new
  isDisabled?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
  rightMenu?: React.ReactNode;
}

export default function ContactAvatar({
  imageUrl,
  title,
  subtitle,
  tags,
  onTagClick,
  isGroup = false,
  isSelected = false,
  isSelectionMode = false,
  isActive = false, // ✅ default false
  isDisabled = false,
  size = "md",
  onClick,
  rightMenu,
}: ContactAvatarProps) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
  };

  const sizeConfig = {
    sm: {
      avatar: "h-9 w-9",
      icon: "h-3 w-3",
      text: "text-sm",
      gap: "gap-2",
      subtitle: "text-xs",
      check: "h-3 w-3",
    },
    md: {
      avatar: "h-10 w-10",
      icon: "h-4 w-4",
      text: "text-sm",
      gap: "gap-3",
      subtitle: "text-sm",
      check: "h-4 w-4",
    },
    lg: {
      avatar: "h-11 w-11",
      icon: "h-4 w-4",
      text: "text-sm",
      gap: "gap-3",
      subtitle: "text-sm",
      check: "h-4 w-4",
    },
    xl: {
      avatar: "h-12 w-12",
      icon: "h-5 w-5",
      text: "text-sm",
      gap: "gap-5",
      subtitle: "text-sm",
      check: "h-4.5 w-4.5",
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      onClick={!isDisabled ? onClick : undefined}
      className={`
        px-3 rounded-lg group flex min-h-[80px] items-center py-2 cursor-pointer w-full select-none justify-between
        transition-colors duration-200
        ${config.gap}
        ${isActive
          ? "bg-gray-200 dark:bg-[#2A2A2A]" // ✅ active background
          : "hover:bg-gray-100 dark:hover:bg-[#2E2F2F]"
        }
        ${isActive ? "border-l-4 border-green-500 pl-[calc(0.75rem-4px)]" : ""}
        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {/* Left Group: Selection Checkbox + Avatar + Text Content */}
      <div className="flex items-center flex-1 min-w-0">
        {/* Selection Checkbox */}
        <div
          className={`flex items-center justify-center
            ${isSelectionMode ? "w-6 mr-2" : "w-0"}
            transition-all duration-200
          `}
        >
          {isSelectionMode && (
            <div
              className={`flex items-center justify-center rounded border
                ${isSelected ? "bg-green-500 border-green-500" : "border-gray-400"}
                ${config.check}
              `}
            >
              {isSelected && <Check className={`${config.check} text-white shrink-0`} />}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          className={`${config.avatar} rounded-full flex items-center justify-center overflow-hidden shrink-0
            bg-gray-200 dark:bg-[#242626]  min-w-0
          `}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title || "Unknown"}
              className={`${config.avatar} rounded-full object-cover`}
              onError={handleError}
            />
          ) : isGroup ? (
            <Users2 className={`${config.icon} text-gray-400`} />
          ) : (
            <User2 className={`${config.icon} text-gray-400`} />
          )}
        </div>

        {/* Text Content */}
        <div className="min-w-0 flex-1 flex flex-col justify-center ml-3 min-w-0">
          <div className={`font-medium ${config.text} truncate text-left leading-tight`}>
            {title || "Unknown"}
          </div>
          {subtitle && (
            <div className={`truncate ${config.subtitle} text-gray-400 leading-tight mt-0.5 mb-1 break-words`}>
              {subtitle.length > 40 ? subtitle.slice(0, 40) + "..." : subtitle}
            </div>
          )}

          {/* Tags (horizontal scroll) */}
          {tags && tags.length > 0 && (
            <div className="flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {tags.map((tag, index) => (
                <Badge 
                key={index} 
                variant={"outline"}
                onClick={(e) => {
                    e.stopPropagation();
                    onTagClick?.(tag);
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Right Side (optional) */}
      {!isSelectionMode && rightMenu && (
        <div className="flex items-center justify-end shrink-0">
          {rightMenu}
        </div>
      )}
    </div>
  );
}
