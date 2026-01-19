"use client";

import { useEffect, useMemo, useState } from "react";
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
import * as z from "zod";
import { ShadcnPhoneInput } from "@/components/ui/input";
import { ImportedContact } from "@/types/Contact";
import { useAddContact } from "@/hooks/contact/useAddContact";
import { Badge } from "@/components/ui/badge";

type ContactForm = z.infer<typeof contactSchema>;
type Mode = "add" | "edit";
type Props = {
  open: boolean;
  setOpen: (val: boolean) => void;
  onSuccess?: () => void;
  contact?: ImportedContact | null;   // if you pass this -> edit mode, otherwise add mode
};

export default function AddEditContactDialog({ open, setOpen, onSuccess, contact }: Props) {
  const mode: Mode = useMemo(() => (contact?.id ? "edit" : "add"), [contact]);
  const [submitting, setSubmitting] = useState(false);

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>({
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

  const { addContact, updateContact } = useAddContact(() => {
    setOpen(false);
    reset();
    onSuccess?.();
  });

  // ✅ Prefill support for Edit mode
  useEffect(() => {
    if (!open) return;

    reset({
      name: contact?.name || "",
      email: contact?.email || "",
      phones: contact?.phones && contact.phones.length > 0
          ? contact.phones.map((p) => ({ number: p }))
          : [{ number: "" }],
      tags: contact?.tags || [],
    });

    replace(
      contact?.phones && contact.phones.length > 0
        ? contact.phones.map((p) => ({ number: p }))
        : [{ number: "" }]
    );
    
  }, [open, contact, reset, replace]);

  const closeDialog = () => setOpen(false);

  const submit = async (data: ContactForm) => {
    const payload: ImportedContact = {
      id: contact?.id,
      name: data.name,
      phones: data.phones.map((p) => p.number),
      email: data.email || undefined,
      tags: data.tags || [],
    };

    setSubmitting(true);

    try {
      if (mode === "add") {
        await addContact({ contact: payload });
      } else {
        await updateContact({ contact: payload });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              <Input placeholder="Enter name" {...register("name")} />
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
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
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
                variant="outline"
                size="sm"
                onClick={() => append({ number: "" })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Phone
              </Button>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Email (optional)</label>
              <Input placeholder="Enter email" {...register("email")} />
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
                    const clean = value.trim();
                    if (!clean || tags.includes(clean)) return;
                    field.onChange([...tags, clean]);
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
                          <Badge
                            key={tag}
                            variant={"outline"}
                          >
                            <div className="flex flex-wrap gap-2">
                              <p>{tag}</p>
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </Badge>
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

            <Button type="submit" disabled={submitting}>
              {submitting
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
}
