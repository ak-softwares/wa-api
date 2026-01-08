"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Plus, X } from "lucide-react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "sonner";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShadcnPhoneInput } from "@/components/ui/input";
import { contactSchema } from "@/schemas/contactSchema";

type ContactForm = z.infer<typeof contactSchema>;

interface UpdateContactDialogProps {
  contact: {
    id: string;
    name: string;
    phones: string[];
    email?: string | null;
  };
  onContactUpdated?: () => void;
}

export default function UpdateContactDialog({
  contact,
  onContactUpdated,
}: UpdateContactDialogProps) {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: contact.name,
      phones: contact.phones.map(phone => ({ number: phone })),
      email: contact.email || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "phones",
  });

  const onSubmit = async (data: ContactForm) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wa-accounts/contacts/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phones: data.phones.map(phone => phone.number),
          email: data.email || null,
        }),
      });

      const json: ApiResponse = await res.json();
      if (json.success) {
        setIsUpdateDialogOpen(false);
        reset(data);
        if (onContactUpdated) onContactUpdated();
        toast.success("Contact updated successfully");
      } else {
        toast.error(json.message || "Failed to update contact");
      }
    } catch (err) {
      toast.error("Error updating contact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <Input placeholder="Enter name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Phone Numbers */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Numbers</label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <Controller
                    name={`phones.${index}.number`}
                    control={control}
                    render={({ field }) => (
                      <ShadcnPhoneInput
                        value={field.value}
                        onChange={field.onChange}
                      />
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
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="h-10 w-10 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {errors.phones?.message && (
              <p className="text-xs text-red-500">{errors.phones.message}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ number: "" })}
              className="mt-2"
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

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}