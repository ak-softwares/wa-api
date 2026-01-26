"use client";

import { useEffect, useMemo } from "react";
import { ToolCatalog, ToolStatus, ToolPayload, ToolCredentialType, Tool, ToolPasswordMasking } from "@/types/Tool";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { useToolMutation } from "@/hooks/tools/useToolMutation";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type Props = {
  open: boolean;
  tool: ToolCatalog | null;
  mode?: "connect" | "edit";
  onClose: () => void;
  onSuccess?: (tool: Tool) => void;
};

// helper: map credential type to input type
const getInputType = (type: ToolCredentialType) => {
  switch (type) {
    case ToolCredentialType.EMAIL:
      return "email";
    case ToolCredentialType.URL:
      return "url";
    case ToolCredentialType.NUMBER:
      return "number";
    case ToolCredentialType.PASSWORD:
    case ToolCredentialType.TOKEN:
    case ToolCredentialType.KEY:
    case ToolCredentialType.SECRET:
      return "password";
    default:
      return "text";
  }
};

export function ToolConnectDialog({ open, tool, mode = "connect", onClose, onSuccess }: Props) {
  const { createTool, updateTool, loading } = useToolMutation();

  const fields = tool?.credentials ?? [];

  // ✅ dynamic zod schema based on tool credential fields
  const schema = useMemo(() => {
    const shape: Record<string, z.ZodTypeAny> = {};

    fields.forEach((f) => {
      shape[f.key] = f.required
        ? z.string().min(1, `${f.label} is required`)
        : z.string().optional().default(""); // ✅ ensures string output
    });

    return z.object({
      credentials: z.object(shape),
      active: z.boolean(),
    });
  }, [fields]);


  type FormValues = z.infer<typeof schema>;

  // ✅ ToolCatalog.credentials is an array, so default values should be empty strings
  const defaultValues = useMemo<FormValues>(() => {
    const creds: Record<string, string> = {};

    fields.forEach((f) => {
      creds[f.key] = f.value || "";
      // creds[f.key] = f.value === ToolPasswordMasking.MASKED ? "" : (f.value || "");
    });

    return {
      credentials: creds,
      // active: tool?.active ?? true,
      active: mode === "connect" ? true : tool?.active ?? true,
    };
  }, [fields, tool?.active]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const initialCredentials = useMemo(() => defaultValues.credentials, [defaultValues]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  // reset form when tool changes / dialog opens
  useEffect(() => {
    if (open) reset(defaultValues);
  }, [defaultValues, reset, open]);

  const active = watch("active");

  const onSubmit = async (data: FormValues) => {
    if (!tool) return;
    let result: Tool | undefined;

    // ✅ only changed credential fields
    const changedCredentials: Record<string, string> = {};

    Object.entries(data.credentials).forEach(([key, value]) => {
      const initialValue = initialCredentials[key] ?? "";
      // only include if changed
      if (value !== initialValue) {
        changedCredentials[key] = value as string;
      }
    });

    // ✅ also allow updating active if changed
    const activeChanged = data.active !== defaultValues.active;

    if (mode === "connect") {
      const payload: ToolPayload = {
        id: tool.id,
        name: tool.name,
        category: tool.category,
        active: data.active,
        status: ToolStatus.CONNECTED,
        credentials: data.credentials as Record<string, string>,
      };
      result = await createTool(payload);
      if (!result) return;
    } else {
      if (!tool._id) return;

      const payload: ToolPayload = {
        _id: tool._id,
        id: tool.id,
        status: ToolStatus.CONNECTED,
        ...(activeChanged ? { active: data.active } : {}),
        ...(Object.keys(changedCredentials).length > 0
          ? { credentials: changedCredentials }
          : {}),
      };

      // ✅ if nothing changed, don't call API
      if (!activeChanged && Object.keys(changedCredentials).length === 0) {
        onClose();
        return;
      }
      
      result = await updateTool(tool._id, payload);
      if (!result) return;
    }

    onClose();
    onSuccess?.(result);
  };

  const title = mode === "edit" ? `Manage ${tool?.name}` : `Connect ${tool?.name}`;

  const description =
    mode === "edit"
      ? "Update your credentials or enable/disable this integration."
      : "Add your credentials to connect this integration.";

  const buttonText = mode === "edit" ? "Save Changes" : "Save & Connect";

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tool?.logo || ""}
                alt={tool?.name || "Tool"}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div className="flex flex-col justify-center">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Fields */}
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No credentials required for this tool.
            </p>
          ) : (
            fields.map((field) => {
              const fieldError = errors.credentials?.[field.key];

              return (
                <div key={field.key} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.label}
                    {field.required ? " *" : ""}
                  </Label>

                  <Input
                    type={getInputType(field.type)}
                    placeholder={field.placeholder}
                    {...register(`credentials.${field.key}`)}
                    className={
                      fieldError
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />

                  {fieldError && (
                    <p className="text-xs text-red-500">
                      {String(fieldError.message)}
                    </p>
                  )}
                </div>
              );
            })
          )}

          {/* Active Toggle */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 dark:border-white/10 p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Integration Status</Label>

                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    active
                      ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300"
                  }`}
                >
                  {active ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                Turn off to stop using this tool without disconnecting it.
              </p>
            </div>

            <Switch checked={active} onCheckedChange={(v) => setValue("active", v)} />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading || isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading || isSubmitting}>
              {loading || isSubmitting ? "Saving..." : buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
