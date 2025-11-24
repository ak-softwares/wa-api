"use client";

import { useState, useCallback } from "react";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
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

type ContactForm = z.infer<typeof contactSchema>;

export const useAddContact = (onSuccess?: () => void) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phones: [{ number: "" }],
      email: "",
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "phones",
  });

  // -----------------------------
  // 🔥 Open dialog with optional prefilled data
  // -----------------------------
  const openDialog = useCallback(
    (prefilled?: Partial<ContactForm>) => {
      if (prefilled) {
        // Name
        if (prefilled.name) setValue("name", prefilled.name);

        // Email
        if (prefilled.email) setValue("email", prefilled.email);

        // Phones
        if (prefilled.phones && prefilled.phones.length > 0) {
          replace(prefilled.phones);
        } else {
          replace([{ number: "" }]);
        }
      } else {
        // Reset to empty form
        reset({
          name: "",
          phones: [{ number: "" }],
          email: "",
        });
      }

      setIsOpen(true);
    },
    [reset, replace, setValue]
  );

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  // -----------------------------
  // 🔥 Submit Handler
  // -----------------------------
  const submit = async (data: ContactForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phones: data.phones.map((p) => p.number),
          email: data.email || null,
        }),
      });

      const json: ApiResponse = await res.json();

      if (json.success) {
        toast.success("Contact saved successfully");
        reset();
        setIsOpen(false);
        onSuccess?.();
      } else {
        toast.error(json.message || "Failed to save contact");
      }
    } catch (e) {
      toast.error("Error saving contact");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // 🔥 Dialog Component
  // -----------------------------
  const AddContactDialog = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{"Add new contact"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4 pt-4">
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

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return {
    openAddContactDialog: openDialog, // can pass prefilled
    closeAddContactDialog: closeDialog,
    AddContactDialog,
  };
};
