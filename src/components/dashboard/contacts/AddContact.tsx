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
import { Plus, X, Phone } from "lucide-react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "sonner";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { contactSchema } from "@/schemas/contactSchema";
import { ShadcnPhoneInput } from "@/components/ui/input";
import { useContacts } from "@/hooks/constact/useContacts"; // 👈 your custom hook

type NewContact = z.infer<typeof contactSchema>;

export default function AddContactDialog() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refreshContacts } = useContacts();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewContact>({
    resolver: zodResolver(contactSchema),
    defaultValues: { 
      name: "", 
      phones: [{ number: "" }], 
      email: "" 
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "phones",
  });

  const onSubmit = async (data: NewContact) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phones: data.phones.map(phone => phone.number),
          email: data.email || null,
        }),
      });

      const json: ApiResponse = await res.json();
      if (json.success) {
        setIsAddDialogOpen(false);
        reset();
        refreshContacts();
        toast.success("Contact added successfully");
      } else {
        toast.error(json.message || "Failed to add contact");
      }
    } catch (err) {
      toast.error("Error adding contact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
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
              onClick={() => setIsAddDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}