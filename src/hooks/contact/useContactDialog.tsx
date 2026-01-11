"use client";

import { useState, useCallback } from "react";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Phone } from "lucide-react";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { contactSchema } from "@/schemas/contactSchema";
import { ShadcnPhoneInput } from "@/components/ui/input";
import { ApiResponse } from "@/types/apiResponse";
import * as z from "zod";
import { Contact } from "@/types/Contact";

type ContactForm = z.infer<typeof contactSchema>;
type Mode = "add" | "edit";

export const useContactDialog = (onSuccess?: () => void) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("add");
  const [contactId, setContactId] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phones: [{ number: "" }],
      email: "",
      tags: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "phones",
  });

  // -----------------------------
  // OPEN ADD CONTACT
  // -----------------------------
  const openAddContactDialog = useCallback(() => {
    setMode("add");
    setContactId(null);
    reset({
      name: "",
      phones: [{ number: "" }],
      email: "",
      tags: [],
    });
    setIsOpen(true);
  }, [reset]);

  // -----------------------------
  // OPEN EDIT CONTACT
  // -----------------------------
  const openEditContactDialog = useCallback(
    (contact: Contact) => {
      setMode("edit");
      setContactId(contact._id!.toString());

      setValue("name", contact.name || "");
      setValue("email", contact.email || "");
      setValue("tags", contact.tags || []);

      replace(
        contact.phones?.length
          ? contact.phones.map((p) => ({ number: p }))
          : [{ number: "" }]
      );

      setIsOpen(true);
    },
    [replace, setValue]
  );

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  // -----------------------------
  // SUBMIT HANDLER
  // -----------------------------
  const submit = async (data: ContactForm) => {
    setLoading(true);

    try {
      const res = await fetch(
        mode === "add"
          ? "/api/wa-accounts/contacts"
          : `/api/wa-accounts/contacts/${contactId}`,
        {
          method: mode === "add" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            phones: data.phones.map((p) => p.number),
            email: data.email || null,
            tags: data.tags || [],
          }),
        }
      );

      const json: ApiResponse = await res.json();

      if (json.success) {
        toast.success(
          mode === "add"
            ? "Contact added successfully"
            : "Contact updated successfully"
        );
        reset();
        setIsOpen(false);
        onSuccess?.();
      } else {
        toast.error(json.message || "Something went wrong");
      }
    } catch {
      toast.error("Request failed");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // DIALOG COMPONENT
  // -----------------------------
  const ContactDialog = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {mode === "add" ? "Add Contact" : "Edit Contact"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)}>
          {/* Scrollable Body */}
          <div className="max-h-[70vh] overflow-y-auto px-6 pt-4 pb-24 space-y-4">

            {/* Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <Input {...register("name")} placeholder="Enter name" />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Phones */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Numbers</label>

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Controller
                      name={`phones.${index}.number`}
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <ShadcnPhoneInput
                            value={field.value}
                            onChange={field.onChange}
                          />
                          {field.value && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <Phone className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      )}
                    />
                    {errors.phones?.[index]?.number && (
                      <p className="text-xs text-red-500">
                        {errors.phones[index]?.number?.message}
                      </p>
                    )}
                  </div>

                  {index > 0 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => append({ number: "" })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Phone
              </Button>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Email (optional)</label>
              <Input {...register("email")} placeholder="Enter email" />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>

              <Controller
                name="tags"
                control={control}
                render={({ field }) => {
                  const tags = field.value || [];

                  const addTag = (value: string) => {
                    if (!value.trim() || tags.includes(value)) return;
                    field.onChange([...tags, value]);
                  };

                  const removeTag = (tag: string) => {
                    field.onChange(tags.filter((t) => t !== tag));
                  };

                  return (
                    <>
                      <Input
                        placeholder="Type tag and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />

                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </>
                  );
                }}
              />
            </div>
          </div>

          {/* Sticky Footer */}
          <DialogFooter className="border-t px-6 py-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? mode === "add"
                  ? "Adding…"
                  : "Updating…"
                : mode === "add"
                ? "Add Contact"
                : "Update Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return {
    openAddContactDialog,
    openEditContactDialog,
    closeDialog,
    ContactDialog,
  };
};
