"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, Trash2 } from "lucide-react"
import { ApiResponse } from "@/types/apiResponse";
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/sonner"
import { useRouter } from "next/navigation";

interface PhoneNumber {
  verified_name: string
  display_phone_number: string
  quality_rating: string
  last_onboarded_time: string
  code_verification_status?: string
}

interface PhoneNumberCardProps {
  showRemoveButton?: boolean // optional prop
}

export default function PhoneNumberCard({ showRemoveButton = false }: PhoneNumberCardProps) {
  const [phoneData, setPhoneData] = useState<PhoneNumber | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingPhone, setDeletingPhone] = useState(false)

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {

        const res = await fetch("/api/facebook/get-phone-numbers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })

        const result: ApiResponse = await res.json()

        if (!result.success) {
          setError(result.message)
          return
        }

        const phone = result.data?.[0] || null
        setPhoneData(phone)
      } catch (err) {
        setError("Something went wrong while fetching data " + err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [ ])

  const handleDelete = async () => {
    setDeletingPhone(true)
    try {
      const res = await fetch("/api/facebook/accounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      const result: ApiResponse = await res.json()
      if (result.success) {
        setPhoneData(null)
        router.refresh(); // ✅ Revalidates and refreshes current route
        toast.success("Phone number removed successfully")
      } else {
        toast.error(result.message || "Failed to remove phone number")
      }
    } catch (err: any) {
      toast.error("Failed to delete phone number: " + err.message)
    } finally {
      setDeletingPhone(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <Skeleton className="h-6 w-32 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        </CardContent>
      </Card>
    )
  }
//   if (error) return <p className="text-red-500">{error}</p>
//   if (!phoneData) return <p>No phone numbers found.</p>

  if (error) return <span></span>
  if (!phoneData) return <span></span>

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="flex items-center justify-center space-x-2">
          <CardTitle>{phoneData.verified_name}</CardTitle>
          {phoneData.code_verification_status === "VERIFIED" && (
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500">
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="font-medium">Phone</span>
          <span>{phoneData.display_phone_number}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Quality Rating</span>
          <span>{phoneData.quality_rating}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Onboarded</span>
          <span>
            {new Date(phoneData.last_onboarded_time).toLocaleString()}
          </span>
        </div>

        {/* Delete button with confirmation */}
        { showRemoveButton
              ? (
                  <div className="pt-4 flex justify-between">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={deletingPhone}
                          className="flex items-center space-x-2 w-full"
                        >
                        {deletingPhone ? (
                          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span>{deletingPhone ? "Disconnecting..." : "Disconnect"}</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disconnect Phone Number</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Are you sure you want to remove this phone number?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
                            Disconnect
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
              )
              : (<span></span>)
        }

      </CardContent>
    </Card>
  )
}
