"use client"

import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { profileSchema } from "@/schemas/profileSchema"
import { ShadcnPhoneInput } from "@/components/ui/input"

export default function ProfilePage() {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  })

  // ✅ Load user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile", { method: "GET" })
        const data = await res.json()
        if (res.ok && data.success) {
          setValue("name", data.data.name || "")
          setValue("email", data.data.email || "")
          setValue("phone", String(data.data.phone || ""))
        }
      } catch {
        // toast.error("Error", { description: "Failed to load profile" })
      }
    }
    fetchProfile()
  }, [setValue])

  // ✅ Submit updated profile
  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error("Failed", { description: result.message })
      } else {
        toast.success("Success", { description: result.message })
      }
    } catch {
      toast.error("Error", { description: "Something went wrong" })
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Profile <span className="text-gray-500 text-sm"></span>
        </h1>
      </div>

      {/* Profile Content */}
      <div className="flex flex-col items-center space-y-2 p-4">
        <div className="px-6 py-2 flex flex-col items-center text-center">
          <div className="rounded-full flex items-center justify-center bg-gray-200 dark:bg-[#242626] overflow-hidden
            border soldid white">
            <img src={"/assets/icons/user.svg"} className="w-25 h-25 dark:invert opacity-40" alt={"user"} />
          </div>
            <div className="text-center">
              <Button variant="outline" className="mt-4 mb-2">
                Add profile photo
              </Button>
              <p className="text-sm text-gray-500">Click to change your profile picture</p>
            </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl space-y-6">
          {/* Name Field */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-medium">Name</Label>
            <div className="space-y-2">
              <Input 
                id="name" 
                {...register("name")} 
                placeholder="Enter your full name"
                className="w-full"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-medium">Email</Label>
            <div className="space-y-2">
              <Input 
                id="email" 
                {...register("email")} 
                placeholder="Enter your email"
                className="w-full"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-3">
            <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
            <div className="space-y-2">
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <ShadcnPhoneInput
                    value={field.value || ""}  
                    onChange={(val: string) => field.onChange(val || "")}
                    stopCountryCode={true}
                  />
                )}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}