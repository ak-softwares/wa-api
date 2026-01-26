import { ToolStatus } from "@/types/Tool";

function getToolStatusBadgeConfig(status: ToolStatus) {
  const base = "px-2 py-1 rounded-full text-xs font-medium";

  switch (status) {
    case ToolStatus.CONNECTED:
      return {
        label: "Connected",
        className: `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300`,
      };

    case ToolStatus.DISABLED:
      return {
        label: "Approved",
        className: `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300`,
      };

    case ToolStatus.PENDING:
      return {
        label: "Pending",
        className: `${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300`,
      };

    case ToolStatus.IN_PROGRESS:
      return {
        label: "In progress",
        className: `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300`,
      };

    case ToolStatus.FAILED:
      return {
        label: "Failed",
        className: `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300`,
      };

    case ToolStatus.NOT_CONNECTED:
    default:
      return {
        label: "Not connected",
        className: `${base} bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300`,
      };
  }
}

type StatusBadgeProps = {
  status: ToolStatus;
};

export function ToolStatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = getToolStatusBadgeConfig(status);
  return <span className={className}>{label}</span>;
}
