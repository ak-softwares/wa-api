import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ToolCatalog, ToolStatus } from "@/types/Tool";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Trash2 } from "lucide-react";

type ToolTileProps = {
  tool: ToolCatalog;
  onConnect?: (tool: ToolCatalog) => void;
  onManage?: (tool: ToolCatalog) => void;
  onToggleActive?: (tool: ToolCatalog, active: boolean) => void;
  onToggleLoading?: (tool: ToolCatalog) => boolean;
  onDelete?: (tool: ToolCatalog) => void;
  onDeleteLoading?: (tool: ToolCatalog) => boolean;
};

export function ToolTile({
  tool,
  onConnect,
  onManage,
  onToggleActive,
  onToggleLoading,
  onDelete,
  onDeleteLoading,
}: ToolTileProps) {
  const isConnected = tool.status === ToolStatus.CONNECTED;
  const toggleLoading = onToggleLoading?.(tool) ?? false;
  const deleteLoading = onDeleteLoading?.(tool) ?? false;

  return (
    <Card className="p-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden">
              {tool.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {tool.name?.slice(0, 1)}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {tool.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {tool.category || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {toggleLoading && (
              <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
            )}
            <Switch
              checked={!!tool.active}
              disabled={!isConnected || toggleLoading}
              onCheckedChange={(v) => onToggleActive?.(tool, v)}
              title={tool.active ? "Activate tool" : "Deactivate tool"}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 -mt-5">
        <p className="text-sm text-gray-600 dark:text-gray-300 pb-5">
          {tool.desc || "No description available."}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <Button
            variant={isConnected ? "outline" : "default"}
            onClick={() => (isConnected ? onManage?.(tool) : onConnect?.(tool))}
          >
            {isConnected ? "Manage" : "Connect"}
          </Button>
          {/* ✅ Delete Button (only when connected) */}
          {isConnected && (
            <Button
              variant="ghost"
              size="icon"
              disabled={toggleLoading || deleteLoading}
              onClick={() => onDelete?.(tool)}
              title="Delete tool"
            >
              {deleteLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ToolTileSkeleton() {
  return (
    <Card className="p-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <Skeleton className="w-11 h-11 rounded-2xl" />

            <div className="space-y-2">
              {/* Tool name */}
              <Skeleton className="h-4 w-28" />
              {/* Category */}
              <Skeleton className="h-3 w-20" />
            </div>
          </div>

          {/* Switch */}
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-[80%]" />
        </div>

        {/* Button */}
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}