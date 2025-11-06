'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, ArrowLeft, CheckCircle2, User2, Phone, Mail } from "lucide-react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "sonner";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShadcnPhoneInput } from "@/components/ui/input";
import { contactSchema } from "@/schemas/contactSchema";
import IconButton from "@/components/common/IconButton";

type ContactForm = z.infer<typeof contactSchema>;

export default function NewContactPage() {
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
      name: "",
      phones: [{ number: "" }],
      email: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "phones",
  });

  const onSubmit = async (data: ContactForm) => {
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
        toast.success("Contact created successfully");
        reset();
        router.back(); // Go back to contacts list
      } else {
        toast.error(json.message || "Failed to create contact");
      }
    } catch (err) {
      toast.error("Error creating contact");
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
            <h1 className="text-xl font-semibold">New Contact</h1>
          </div>
        </div>
    
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-5 space-y-8">
          {/* Profile Section */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-[#242626] flex items-center justify-center mx-auto">
              <User2 className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Contact Profile</h2>
              <p className="text-sm text-gray-500">Add basic contact information</p>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <User2 className="w-4 h-4 text-green-600" />
              </div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name <span className="text-red-500">*</span>
              </label>
            </div>
            <Input 
              placeholder="Enter contact name" 
              {...register("name")}
              className="w-full px-4 py-3 border border-gray-300 dark:border-[#333434] rounded-lg bg-white dark:bg-[#1E1F1F] focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Phone Numbers Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Numbers <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-500">{fields.length} added</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Add at least one phone number</p>
              </div>
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
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <X className="w-3 h-3" />
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
                      className="h-12 w-12 shrink-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {errors.phones?.message && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.phones.message}
              </p>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ number: "" })}
              className="w-full border-dashed border-gray-300 dark:border-[#333434] hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 py-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Phone Number
            </Button>
          </div>

          {/* Email Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Mail className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <p className="text-xs text-gray-500 mt-1">Optional email address</p>
              </div>
            </div>
            <Input 
              type="email"
              placeholder="Enter email address" 
              {...register("email")}
              className="w-full px-4 py-3 border border-gray-300 dark:border-[#333434] rounded-lg bg-white dark:bg-[#1E1F1F] focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.email.message}
              </p>
            )}
            <Button 
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={loading || !isDirty}
                className="px-6 py-2 w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                </>
                ) : (
                <>
                    <CheckCircle2 className="w-4 h-4" />
                    Create Contact
                </>
                )}
            </Button>
          </div>

          {/* Quick Tips */}
          <div className="bg-gray-50 dark:bg-[#1E1F1F] rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Tips</h4>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Add multiple phone numbers for the same contact</li>
              <li>• Phone numbers will be validated automatically</li>
              <li>• Email address is optional but recommended</li>
              <li>• You can edit this contact anytime later</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile Footer Actions - Sticky on mobile */}
      <div className="p-5 border-t border-gray-200 dark:border-[#333434] bg-white dark:bg-[#1A1A1A] lg:hidden sticky bottom-0">
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 py-3 border-gray-300 dark:border-[#333434] hover:bg-gray-100 dark:hover:bg-[#2E2F2F]"
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={loading || !isDirty}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Create
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}