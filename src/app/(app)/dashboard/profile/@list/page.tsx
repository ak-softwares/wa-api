"use client"

import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
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
      company: "",
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
          setValue("company", data.data.company || "")
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
      <div className="flex flex-col items-center space-y-8">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24 border-2 border-gray-200">
            <AvatarImage src="/profile.png" alt="Profile Picture" />
            <AvatarFallback className="text-lg">A</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <Button variant="outline" className="mb-2">
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

          {/* About Field */}
          <div className="space-y-3">
            <Label htmlFor="about" className="text-sm font-medium">About</Label>
            <div className="space-y-2">
              <Input 
                id="about" 
                placeholder="Hey there! I am using WhatsApp."
                className="w-full"
              />
              <p className="text-sm text-gray-500">This is not your username or pin. This name will be visible to your WhatsApp contacts.</p>
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
                  />
                )}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}