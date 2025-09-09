"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Check } from "lucide-react"
import { useSession } from "next-auth/react";
import { ApiResponse } from "@/types/apiResponse";

interface PhoneNumber {
  verified_name: string
  display_phone_number: string
  quality_rating: string
  last_onboarded_time: string
  code_verification_status?: string
}

export default function PhoneNumberCard() {
  const [phoneData, setPhoneData] = useState<PhoneNumber | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


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

  if (error) return <p></p>
  if (!phoneData) return <p></p>

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
      </CardContent>
    </Card>
  )
}
