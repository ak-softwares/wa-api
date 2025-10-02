import { User2 } from "lucide-react";

interface ContactAvatarProps {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function ContactAvatar({ 
  imageUrl, 
  title, 
  subtitle, 
  size = "md" 
}: ContactAvatarProps) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none"; // hide broken image
  };

  // Size configurations with proper scaling
  const sizeConfig = {
    sm: {
      avatar: "h-8 w-8",
      icon: "h-3 w-3",
      text: "text-xs",
      gap: "gap-2",
      subtitle: "text-xs"
    },
    md: {
      avatar: "h-10 w-10",
      icon: "h-4 w-4",
      text: "text-sm",
      gap: "gap-3",
      subtitle: "text-sm"
    },
    lg: {
      avatar: "h-11 w-11",
      icon: "h-4 w-4",
      text: "text-sm",
      gap: "gap-3",
      subtitle: "text-sm"
    },
    xl: {
      avatar: "h-12 w-12",
      icon: "h-5 w-5",
      text: "text-sm",
      gap: "gap-3",
      subtitle: "text-sm"
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`col-span-12 md:col-span-5 flex items-center ${config.gap}`}>
      <div className={`${config.avatar} rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 overflow-hidden`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title || "Unknown"}
            className={`${config.avatar} rounded-full object-cover`}
            onError={handleError}
          />
        ) : (
          <User2 className={`${config.icon} dark:text-gray-400 text-gray-600`} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`font-medium ${config.text} truncate`}>{title || "Unknown"}</div>
        {subtitle && (
          <div className={`truncate ${config.subtitle} text-gray-500`}>
            {subtitle.length > 30 ? subtitle.slice(0, 30) + "..." : subtitle}
          </div>
        )}
      </div>
    </div>
  );
}