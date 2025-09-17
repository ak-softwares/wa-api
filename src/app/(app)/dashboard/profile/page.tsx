"use client"

import { useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input, ShadcnPhoneInput } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ResetPasswordDialog from "@/components/dashboard/profile/ResetPassword"
import DeleteAccount from "@/components/dashboard/profile/DeleteAccount"
import { toast } from "sonner"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { profileSchema } from "@/schemas/profileSchema"
import PhoneNumberCard from "@/components/dashboard/rightbar/widgets/phoneNumberCard"



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
    <main className="flex-1 p-6 space-y-6 overflow-y-auto">
      <div className="grid grid-cols-10 gap-4">
        {/* Account Settings - 70% */}
        <div className="col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/profile.png" alt="Profile Picture" />
                  <AvatarFallback>WA</AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Picture</Button>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" {...register("name")} />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" {...register("email")} />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                            <ShadcnPhoneInput
                              value={field.value || ""}          // ✅ always a string
                              onChange={(val: string) => field.onChange(val || "")} // ✅ enforce string
                            />
                      )}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" {...register("company")} />
                    {errors.company && <p className="text-sm text-red-500">{errors.company.message}</p>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Account Settings */}
        <div className="col-span-3 space-y-4">
          <PhoneNumberCard showRemoveButton={true} />
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ResetPasswordDialog />
              <DeleteAccount />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
