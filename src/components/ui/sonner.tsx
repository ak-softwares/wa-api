"use client"

import { toast as sonnerToast, ExternalToast } from "sonner";
import { useTheme } from "next-themes"
import { Toaster as Sonner} from "sonner"
import { User } from "lucide-react"


type ToasterProps = React.ComponentProps<typeof Sonner>
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster"
      // richColors={true}
      // duration={5000}
      // closeButton
      position="bottom-right"
      {...props}
    />
  )
}

export { Toaster }

// helper to detect theme (light / dark)
const getTheme = () =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

// ✅ color palettes for light/dark themes
const styles = {
  success: {
    light: { background: "#ECFDF3", color: "#008A2E", descriptionColor: "#065F46", border: "1px solid #C9F9DD", fontWeight: "bold", fontSize: "13px" },
    dark: { background: "#0F2A29", color: "#86efac", descriptionColor: "#A7F3D0", border: "1px solid #047857", fontWeight: "bold", fontSize: "13px" },
  },
  error: {
    light: { background: "#FEF2F2", color: "#DC2626", descriptionColor: "#991B1B", border: "1px solid #FECACA", fontWeight: "bold", fontSize: "13px" },
    dark: { background: "#2A0F0F", color: "#FCA5A5", descriptionColor: "#FCA5A5", border: "1px solid #B91C1C", fontWeight: "bold", fontSize: "13px" },
  },
  warning: {
    light: { background: "#FFFBEB", color: "#D97706", descriptionColor: "#B45309", border: "1px solid #FDE68A", fontWeight: "bold", fontSize: "13px" },
    dark: { background: "#2A240F", color: "#FCD34D", descriptionColor: "#FBBF24", border: "1px solid #D97706", fontWeight: "bold", fontSize: "13px" },
  },
  info: {
    light: { background: "#EFF6FF", color: "#1D4ED8", descriptionColor: "#1E40AF", border: "1px solid #BFDBFE", fontWeight: "bold", fontSize: "13px" },
    dark: { background: "#0F1A2A", color: "#93C5FD", descriptionColor: "#60A5FA", border: "1px solid #1D4ED8", fontWeight: "bold", fontSize: "13px" },
  },
  default: {
    light: { background: "#F8FAFC", color: "#334155", descriptionColor: "#475569", border: "1px solid #E2E8F0", fontWeight: "500", fontSize: "13px" },
    dark: { background: "#101828", color: "#E2E8F0", descriptionColor: "#CBD5E1", border: "1px solid #334155", fontWeight: "500", fontSize: "13px" },
  },
};

const renderDescription = (desc: any) => {
  if (!desc) return null;
  return typeof desc === "function" ? desc() : desc;
};

export const showToast = {
  success: (msg: string, options?: ExternalToast) =>
    sonnerToast.success(msg, {
      ...options,
      style: { ...styles.success[getTheme()], ...(options?.style || {}) },
      description: options?.description && (
          <span style={{ color: styles.success[getTheme()].descriptionColor }}>
            {renderDescription(options.description)}
          </span>
        ),
    }),
  error: (msg: string, options?: ExternalToast) =>
    sonnerToast.error(msg, {
      ...options,
      style: { ...styles.error[getTheme()], ...(options?.style || {}) },
      description: options?.description && (
          <span style={{ color: styles.error[getTheme()].descriptionColor }}>
            {renderDescription(options.description)}
          </span>
        ),
    }),
  warning: (msg: string, options?: ExternalToast) =>
    sonnerToast.warning(msg, {
      ...options,
      style: { ...styles.warning[getTheme()], ...(options?.style || {}) },
      description: options?.description && (
          <span style={{ color: styles.warning[getTheme()].descriptionColor }}>
            {renderDescription(options.description)}
          </span>
        ),
    }),
  info: (msg: string, options?: ExternalToast) =>
    sonnerToast.info(msg, {
      ...options,
      style: { ...styles.info[getTheme()], ...(options?.style || {}) },
      description: options?.description && (
          <span style={{ color: styles.info[getTheme()].descriptionColor }}>
            {renderDescription(options.description)}
          </span>
        ),
    }),
  default: (msg: string, options?: ExternalToast) =>
    sonnerToast(msg, {
      ...options,
      style: { ...styles.default[getTheme()], ...(options?.style || {}) },
      description: options?.description && (
          <span style={{ color: styles.default[getTheme()].descriptionColor }}>
            {renderDescription(options.description)}
          </span>
        ),
    }),

  // ✅ New message type (with user avatar + name + message)
  message: (msg: string, options?: ExternalToast) =>
    sonnerToast.success(msg, {
      ...options,
      icon: <User className="w-5 h-5 text-green-700" />, // custom icon
      style: { ...styles.success[getTheme()], ...(options?.style || {}) },
      description: options?.description && (
        <span style={{ color: styles.success[getTheme()].descriptionColor }}>
          {renderDescription(
            typeof options.description === "string" && options.description.length > 40
              ? options.description.slice(0, 40) + "…"
              : options.description
          )}
        </span>
      ),
    }),
};
