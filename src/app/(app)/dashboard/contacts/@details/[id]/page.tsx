

// export default function ContactDetails({ params }: Props) {
//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-semibold mb-2">Contact Details</h2>
//       <p className="text-gray-400">You selected contact ID: {params.id}</p>
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, ArrowLeft, CheckCircle2 } from "lucide-react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "sonner";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShadcnPhoneInput } from "@/components/ui/input";
import { contactSchema } from "@/schemas/contactSchema";
import IconButton from "@/components/common/IconButton";
import { useContact } from "@/hooks/contact/useContact";
import { Contact } from "@/types/Contact"; // 👈 your contact type

type ContactForm = z.infer<typeof contactSchema>;

interface Props {
  params: { id: string };
}

export default function UpdateContactPage({ params }: Props) {
  const { id } = params;
  const { contact, loading: contectLoading, error } = useContact(id);

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: contact?.name ?? '',
      phones: contact?.phones.map(phone => ({ number: phone })),
      email: contact?.email || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "phones",
  });

  // Reset form when contact changes
  useEffect(() => {
    reset({
      name: contact?.name,
      phones: contact?.phones.map(phone => ({ number: phone })),
      email: contact?.email || "",
    });
  }, [contact, reset]);

  const onSubmit = async (data: ContactForm) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contacts/${contact?._id!.toString()}`, {
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
        toast.success("Contact updated successfully");
        router.back(); // Go back to previous page
      } else {
        toast.error(json.message || "Failed to update contact");
      }
    } catch (err) {
      toast.error("Error updating contact");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirm = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirm) return;
    }
    router.back();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={handleCancel}
            label="Back"
            IconSrc="/assets/icons/arrow-left.svg"
          />
          <div>
            <h1 className="text-xl font-semibold">Edit Contact</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2 border-gray-300 dark:border-[#333434] hover:bg-gray-100 dark:hover:bg-[#2E2F2F]"
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={loading || !isDirty}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Update Contact
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 max-w-2xl space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Name <span className="text-red-500">*</span>
            </label>
            <Input 
              placeholder="Enter contact name" 
              {...register("name")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#333434] rounded-lg bg-white dark:bg-[#1E1F1F] focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Phone Numbers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Numbers <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-500">{fields.length} added</span>
            </div>
            
            <div className="space-y-3">
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
                      <p className="text-xs text-red-500 mt-1">
                        {errors.phones[index]?.number?.message}
                      </p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-10 w-10 shrink-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {errors.phones?.message && (
              <p className="text-xs text-red-500">{errors.phones.message}</p>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ number: "" })}
              className="w-full border-dashed border-gray-300 dark:border-[#333434] hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 py-3"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Phone Number
            </Button>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address (optional)
            </label>
            <Input 
              type="email"
              placeholder="Enter email address" 
              {...register("email")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#333434] rounded-lg bg-white dark:bg-[#1E1F1F] focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
        </form>
      </div>

      {/* Mobile Footer Actions - Sticky on mobile */}
      <div className="p-5 border-t border-gray-200 dark:border-[#333434] bg-white dark:bg-[#1A1A1A] lg:hidden sticky bottom-0">
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 py-2 border-gray-300 dark:border-[#333434] hover:bg-gray-100 dark:hover:bg-[#2E2F2F]"
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={loading || !isDirty}
            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Update
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}