"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Info, ExternalLink, Trash2, CheckCircle, CircleCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { WabaPhoneNumber } from "@/types/WabaAccount"
import { useWaSetupData } from "@/hooks/SetupPageHooks/useWabaSetupData"
import { useDeleteWabaAccount } from "@/hooks/SetupPageHooks/useDeleteWabaAccount"
import { ConfirmDialog } from "@/components/common/dialog/ConfirmDialog"
import { useState } from "react"
import { VerifyPhoneDialog } from "./VerifyPhoneDialog"
import { usePhoneCodeVerification } from "@/hooks/SetupPageHooks/usePhoneCodeVerification"
import Link from "next/link"
import { useSubscribeApp } from "@/hooks/SetupPageHooks/useSubscribeApp"
import { useRegisterPhoneNumber } from "@/hooks/SetupPageHooks/useRegisterPhoneNumber"
import SetupStepper from "@/components/common/SetupStepper"

export default function WhatsAppSetupCard() {
  const { loadingWaba, loadingSetupData, waSetupStatus, wabaAccount, fetchStatus } = useWaSetupData();
  const { deleting, deleteAccount } = useDeleteWabaAccount(() => {
    setOpenDeleteDialog(false)
    fetchStatus()
  })
  const { requestCode, requestCodeLoading } = usePhoneCodeVerification();
  const [openVerifyPhoneDialog, setOpenVerifyPhoneDialog] = useState(false);
  const { isLoading: isSubscribing, subscribeAppToWABA } = useSubscribeApp()
  const { isLoading: isPhoneRegistering, registerPhoneNumber } = useRegisterPhoneNumber()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const router = useRouter();

  const allDone = waSetupStatus?.isTokenAvailable && waSetupStatus?.isAppSubscription 
      && waSetupStatus?.isPhoneRegistered && wabaAccount?.account_review_status === "APPROVED"

  const goToSetup = () => {
    router.push("/dashboard/setup")
  }

  const goToWhatsappAccount = () => {
    window.open(
      "https://business.facebook.com/latest/settings/whatsapp_account",
      "_blank",
      "noopener,noreferrer"
    )
  }

  const steps = [
    {
      id: "token",
      label: "Step 1",
      description: "Connect Whatsapp Number",
      doneDescription: "Whatsapp number connected",
      actionLabel: "Connect WhatsApp",
      onAction: goToSetup,
      disabled: false,
      loading: false,
    },
    {
      id: "status",
      label: "Step 2",
      description: "Whatsapp account status",
      doneDescription: "Whatsapp account Approved",
      actionLabel: "Visit whatsapp business",
      onAction: goToWhatsappAccount,
      disabled: false,
      loading: false,
    },
    {
      id: "sub",
      label: "Step 3",
      description: "Subscribe App",
      doneDescription: "App subscribed successfully",
      actionLabel: "Subscribe App",
      onAction: () => subscribeAppToWABA(fetchStatus),
      loading: isSubscribing,
      disabled: isSubscribing,
    },
    {
      id: "phone",
      label: "Step 4",
      description: "Register Phone Number",
      doneDescription: "Phone registered successfully",
      actionLabel: "Register Phone",
      onAction: () => registerPhoneNumber(fetchStatus),
      loading: isPhoneRegistering,
      disabled: isPhoneRegistering,
    },
  ]

  // Decide which step is currently active
  const currentStepIndex = (() => {
    if (!waSetupStatus?.isTokenAvailable) return 0
    if(wabaAccount?.account_review_status !== "APPROVED") return 1
    if (!waSetupStatus?.isAppSubscription) return 2
    if (!waSetupStatus?.isPhoneRegistered) return 3
    return 4
  })()

  const handleSendCodeAndOpenDialog = async () => {
    const ok = await requestCode("SMS");

    // ✅ open dialog only if requestCode success
    if (ok) {
      setOpenVerifyPhoneDialog(true);
    }
  };

  if (loadingWaba || loadingSetupData) {
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
  if (!waSetupStatus?.isTokenAvailable) {
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleCheck className="h-4 w-4 text-[#0B8576] dark:text-[#4EDCC8]" />
            WhatsApp API Setup
          </CardTitle>
          <CardDescription>Your number is ready to use</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          {allDone ? (
              <div className="bg-[#11B8A2]/20 p-4 rounded-md border border-[#11B8A2] flex items-center text-center justify-center">
                <CheckCircle className="h-5 w-5 text-[#0B8576] dark:text-[#4EDCC8] mr-3" />
                <span className="text-[#0B8576] dark:text-[#4EDCC8]">
                  WhatsApp API is connected and ready to use!
                </span>
              </div>
            ) : (
              <SetupStepper steps={steps} currentStepIndex={currentStepIndex} />
            )
          }
          <div className="flex">
            <div className="flex-1">
              <p className="text-muted-foreground">WhatsApp Business Account</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium">
                  {wabaAccount?.name || "WhatsApp Business Account"}
                </p>

                {/* External link */}
                <Link
                  href="https://business.facebook.com/latest/settings/whatsapp_account"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Account Status</p>
              <Badge 
                variant="outline"
                className={
                  wabaAccount?.account_review_status === "APPROVED" 
                    ? "text-[#0B8576] dark:text-[#4EDCC8] bg-[#11B8A2]/20 border border-[#11B8A2]"
                    : wabaAccount?.account_review_status === "PENDING" 
                    ? "text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700"
                    : wabaAccount?.account_review_status === "REJECTED"
                    ? "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700"
                    : ""
                }
              >
                {wabaAccount?.account_review_status || "Unknown"}
              </Badge>
            </div>
          </div>

          {/* PHONE NUMBERS */}
          <div className="space-y-3">
            <p className="text-muted-foreground font-medium">
              Phone Numbers ({wabaAccount?.phone_numbers?.length || 0})
            </p>
            {wabaAccount?.phone_numbers?.length ? (
              <div className="space-y-3">
                {wabaAccount.phone_numbers.map((phoneNumber: WabaPhoneNumber) => (
                  <div
                    key={phoneNumber?.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-3 border rounded-lg"
                  >
                    {/* 1) NAME */}
                    <div className="min-w-[120px]">
                      <p className="text-muted-foreground">Name</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{phoneNumber?.verified_name || "Not set"}</p>

                        {/* {waSetupStatus?.isPhoneVerified ? (
                          <CircleCheck className="h-4 w-4 text-blue-500" />
                        ) : (
                          <CircleAlert className="h-4 w-4 text-orange-500" />
                        )} */}
                      </div>
                    </div>

                    {/* 2) NUMBER */}
                    <div className="min-w-[120px]">
                      <p className="text-muted-foreground">Phone Number</p>
                      <p className="font-medium">
                        {phoneNumber?.display_phone_number || "N/A"}
                      </p>
                    </div>
    
                    {/* 3) ONBOARDED */}
                    <div className="min-w-[120px]">
                      <p className="text-muted-foreground">Onboarded</p>
                      <p className="font-medium">
                        {phoneNumber?.last_onboarded_time
                          ? new Intl.DateTimeFormat("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                            }).format(new Date(phoneNumber.last_onboarded_time))
                          : "N/A"}
                      </p>
                    </div>
    
                    {/* 4) QUALITY */}
                    <div className="min-w-[120px]">
                      <p className="text-muted-foreground">Quality</p>
                      <Badge variant="outline">
                        {phoneNumber?.quality_rating || "Unknown"}
                      </Badge>
                    </div>

                    {/* {!waSetupStatus.isPhoneVerified  && ( */}
                    {phoneNumber?.code_verification_status !== "VERIFIED"  && (
                      <>
                      <Button
                        variant="outline"
                        disabled={requestCodeLoading}
                        onClick={handleSendCodeAndOpenDialog}
                        size="sm"
                        className="h-7 px-3"
                      >
                        {requestCodeLoading ? "Sending..." : "Verify Phone"}
                      </Button>
                      <VerifyPhoneDialog open={openVerifyPhoneDialog} setOpen={setOpenVerifyPhoneDialog} />
                      </>
                    )}
                    
                    <Button 
                    variant="ghost" 
                    className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-300"
                    disabled={deleting} onClick={() => setOpenDeleteDialog(true)}>
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </div>
              ) : (
                  <div className="p-3 border rounded-lg text-muted-foreground">
                    No phone numbers found.
                  </div>
                )
            }
          </div>
        </CardContent>
        <ConfirmDialog
          open={openDeleteDialog}
          loading={deleting}
          title={"Delete WABA account permanently?"}
          description="This action will permanently remove your WhatsApp Business Account connection, including chats, contacts, AI settings, and all related data. This cannot be undone."
          onCancel={() => setOpenDeleteDialog(false)}
          onConfirm={deleteAccount}
        />
      </Card>
    </>
  )
}
