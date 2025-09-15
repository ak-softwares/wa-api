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
import { Edit } from "lucide-react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addPhoneSchema } from "@/schemas/addPhoneSchema"; // reuse same schema
import { ShadcnPhoneInput } from "@/components/ui/input";

type ContactForm = z.infer<typeof addPhoneSchema>;

interface UpdateContactDialogProps {
  contact: {
    id: string;
    name: string;
    phone: string;
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
    resolver: zodResolver(addPhoneSchema),
    defaultValues: {
      name: contact.name,
      phone: contact.phone,
      email: contact.email || "",
    },
  });

  const onSubmit = async (data: ContactForm) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: [data.phone],
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
      <DialogContent>
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

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone</label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <ShadcnPhoneInput
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
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
