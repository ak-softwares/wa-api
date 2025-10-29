"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MessageSquare , Phone, Bell, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiResponse } from "@/types/apiResponse"
import { useRouter } from "next/navigation"
import { useRegisterPhoneNumber } from "@/hooks/SetupPageHooks/useRegisterPhoneNumber"
import { useSubscribeApp } from "@/hooks/SetupPageHooks/useSubscribeApp"


interface SetupStatus {
  token: boolean
  subscription: boolean
  phone: boolean
}

const steps = [
  { id: 1, label: "Connect Whatsapp Number", icon: <MessageSquare  className="h-5 w-5" /> },
  { id: 2, label: "Notification Subscription", icon: <Bell className="h-5 w-5" /> },
  { id: 3, label: "Phone Number Registered", icon: <Phone className="h-5 w-5" /> },
]

export default function SetupProgressCard() {
    // ✅ use custom hooks
  const { isLoading: subLoading, isAppSubscribed, subscribeAppToWABA } = useSubscribeApp()
  const { isLoading: phoneLoading, phoneNumberIsRegistered, registerPhoneNumber } = useRegisterPhoneNumber()

  const router = useRouter()

  const [status, setStatus] = useState<SetupStatus | null>(null)
  const [loading, setLoading] = useState(true)

  // ✅ put fetchStatus in useCallback so we can call it later
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/whatsapp/check-status")
      const result: ApiResponse = await res.json()

      if (result.success) {
        setStatus(result.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  if (loading) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <Skeleton className="h-6 w-40 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    )
  }

  const allDone = status?.token && status?.phone && status?.subscription
  const completedSteps = [
    status?.token,
    status?.phone,
    status?.subscription,
  ].filter(Boolean).length

  const progressValue = (completedSteps / steps.length) * 100

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CardTitle>WhatsApp Business API Setup</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress
            value={progressValue}
            className="h-2 [&>div]:bg-blue-500 bg-gray-200 dark:bg-gray-700"
          />
          <div className="flex justify-between mt-4">
            {steps.map((step, idx) => {
              const isDone =
                (idx === 0 && status?.token) ||
                (idx === 1 && status?.subscription) ||
                (idx === 2 && status?.phone)

              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    isDone
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                > 
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      isDone
                        ? "bg-blue-100 dark:bg-blue-700/20"
                        : "bg-gray-200 dark:bg-gray-800"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span className="text-xs mt-1 font-medium">{step.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Final Status */}
        <div className="pt-4 text-center">
          {allDone ? (
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md border border-green-200 dark:border-green-700 flex items-center text-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-green-700 dark:text-green-300">
                Setup Completed Successfully!
              </span>
            </div>
          ) : (
            <>
              { !status?.token ? (
                // 1) Setup
                <Button
                  className="w-full mb-2"
                  variant="outline"
                  onClick={() => router.push("/dashboard/setup")}
                >
                  Launch Setup
                </Button>
              ) : !status?.subscription ? (
                // 2) Subscribe
                <Button
                  className="w-full mb-2"
                  variant="outline"
                  disabled={subLoading}
                  onClick={() => subscribeAppToWABA(fetchStatus)}
                >
                  {subLoading ? "Subscribing..." : "Subscribe App"}
                </Button>
              ) : !status?.phone ? (
                // 3) Register Phone
                <Button
                  className="w-full mb-2"
                  variant="outline"
                  disabled={phoneLoading}
                  onClick={() => registerPhoneNumber(fetchStatus)}
                >
                  {phoneLoading ? "Registering..." : "Register Phone Number"}
                </Button>
              ) : null }
            </>
          )}
        </div>

      </CardContent>
    </Card>
  )
}
