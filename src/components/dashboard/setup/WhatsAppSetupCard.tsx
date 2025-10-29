"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { CheckCircle2, AlertCircle, Info } from "lucide-react"
import { toast } from "@/components/ui/sonner"
import { ApiResponse } from "@/types/apiResponse"
import { useRouter } from "next/navigation"
import SendTestMessagePopup from "./SendTestMessagePopup"

interface PhoneNumber {
  verified_name: string
  display_phone_number: string
  quality_rating: string
  last_onboarded_time: string
  code_verification_status?: string
}

export default function WhatsAppSetupCard() {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<any>(null)
  const [phoneData, setPhoneData] = useState<PhoneNumber | null>(null)
  const [deletingPhone, setDeletingPhone] = useState(false)
  const router = useRouter();

  const goToSetup = () => {
    // 🔄 Redirect user to your setup page
    router.push("/dashboard/setup");
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/whatsapp/check-status")
        const result: ApiResponse = await res.json()

        if (!result.success) {
          // toast.error(result.message || "Failed to load setup status")
          return
        }
        setStatus(result.data)
      } catch (err: any) {
        toast.error("Error loading setup status: " + err.message)
      }
    }

    const fetchPhone = async () => {
      try {
        const res = await fetch("/api/whatsapp/get-phone-numbers", { method: "POST" })
        const result: ApiResponse = await res.json()

        if (!result.success) return
        setPhoneData(result.data?.[0] || null)
      } catch (err) {
        // ignore phone fetch error silently
      }
    }

    Promise.all([fetchStatus(), fetchPhone()]).finally(() => setLoading(false))
  }, [])

  const handleDelete = async () => {
    setDeletingPhone(true)
    try {
      const res = await fetch("/api/whatsapp/accounts", { method: "DELETE" })
      const result: ApiResponse = await res.json()

      if (result.success) {
        setPhoneData(null)
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
        <CardHeader>
          <CardTitle>WhatsApp API Setup</CardTitle>
          <CardDescription>Loading setup status...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  // Not connected
  if (!status?.token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            WhatsApp Setup Required
          </CardTitle>
          <CardDescription>Connect your Number to WhatsApp Cloud API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Your Number is not Connected to WhatsApp API. Setup required to use the API.
            </span>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">1</div>
              <span>Click "Connect WhatsApp" below</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">2</div>
              <span>Login with Facebook and grant permissions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">3</div>
              <span>Select your WhatsApp Business Account & phone</span>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button className="flex-1" onClick={goToSetup}>Connect WhatsApp</Button>
            <Button variant="outline" size="icon"><Info className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Connected
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          WhatsApp Connected
        </CardTitle>
        <CardDescription>Your number is ready to use</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center gap-2 p-3 border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 rounded-lg">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-800 dark:text-green-200">
            WhatsApp is connected and ready to use!
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-muted-foreground">Phone Number</p>
            <p className="font-medium">{phoneData?.display_phone_number || "N/A"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Business Name</p>
            <p className="font-medium">{phoneData?.verified_name || "Not set"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Onboarded</p>
            <p className="font-medium">
              {phoneData?.last_onboarded_time
                ? new Intl.DateTimeFormat("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  }).format(new Date(phoneData.last_onboarded_time))
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Quality</p>
            <Badge variant="secondary">{phoneData?.quality_rating || "Unknown"}</Badge>
          </div>
        </div>

        <Separator />

        <div className="flex gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1" disabled={deletingPhone}>
                {deletingPhone ? "Removing..." : "Disconnect"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Phone Number</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Do you want to remove this number?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        <div className="flex-1">
          <SendTestMessagePopup />
        </div>

        </div>
      </CardContent>
    </Card>
  )
}
