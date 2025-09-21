"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, ShadcnPhoneInput } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useWhatsAppSignup } from "@/hooks/SetupPageHooks/useWhatsAppAPISignup";
import { useBusinessVerification } from "@/hooks/SetupPageHooks/useBusinessManagerVerification";
import { Label } from "@radix-ui/react-label";
import { 
  ExternalLink,
  Facebook, 
  CheckCircle, 
  Phone, 
  MessageSquare, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  Loader2,
  CreditCard,
  Check
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegisterPhoneNumber } from "@/hooks/SetupPageHooks/useRegisterPhoneNumber";
import { useSendWhatsappMessage } from "@/hooks/whatsapp/useSendWhatsappMessage";
import { sampleMessageSchema } from "@/schemas/sampleMessageSchema";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Controller } from "react-hook-form";

interface SetupStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

type SendMessageForm = z.infer<typeof sampleMessageSchema>;

export default function WhatsAppSetupPage() {
  const router = useRouter();
  const { launchWhatsAppSignup, facebookConnected, isSaving, isLoading: savingStatus } = useWhatsAppSignup();
  const { status, refresh, error, isLoading: isVerifying, manualVerification} = useBusinessVerification();
  const { isLoading: isLoading_register, phoneNumberIsRegistered, registerPhoneNumber } = useRegisterPhoneNumber();
  const { isLoading: isLoading_sendMessage, sendMessage } = useSendWhatsappMessage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [businessVerified, setBusinessVerified] = useState(false);
  const [addPaymentMethod, setPaymentMethod] = useState(false);
  const [testMessageSent, setTestMessageSent] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [preview, setPreview] = useState<SendMessageForm>({
    to: "",
    message: "Hello! This is a test message from your WhatsApp Business API.",
  });

  const form = useForm<SendMessageForm>({
    resolver: zodResolver(sampleMessageSchema),
    defaultValues: preview,
  });

  const { handleSubmit, control, formState: { errors, isSubmitting }, watch } = form;

  // Update preview on field change
  const watchedFields = watch();
  // Update preview on field change
  watch((value) =>
    setPreview({
      to: value.to ?? "",        // default to empty string if undefined
      message: value.message ?? "" // default to empty string if undefined
    })
  );

  const onSubmit = async (data: SendMessageForm) => {
    await sendMessage(
      data.to,
      data.message,
      () => {
        toast.success("Message sent successfully 🚀");
        setTestMessageSent(true);
      },
      (errorMsg) => {
        toast.error(errorMsg || "Failed to send message ❌");
      }
    );
  };

  useEffect(() => {
    if (facebookConnected || phoneNumberIsRegistered || addPaymentMethod) {
      handleNext();
    }
  }, [facebookConnected, phoneNumberIsRegistered, addPaymentMethod]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleVerifyBusiness = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setBusinessVerified(true);
      setIsLoading(false);
    }, 500);
  };

  const handleAddPaymentMethod = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPaymentMethod(true);
      setIsLoading(false);
    }, 500);
  };

  const handleCompleteSetup = () => {
    setSetupComplete(true);
    handleNext();
    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
  };

  const steps: SetupStep[] = [
    {
      id: 1,
      title: "Connect Facebook Account",
      description: "Link your Facebook Business Manager account to get started with WhatsApp Business API.",
      icon: <Facebook className="h-6 w-6 text-blue-600" />
    },
    {
      id: 2,
      title: "Verify Your Business",
      description: "Complete the business verification process with Meta to access WhatsApp Business features.",
      icon: <CheckCircle className="h-6 w-6 text-green-600" />
    },
    {
      id: 3,
      title: "Add Payment Method",
      description: "Add a valid payment method in Meta Business Manager to continue sending WhatsApp Business messages.",
      icon: <CreditCard className="h-6 w-6 text-green-600" />
    },
    {
      id: 4,
      title: "Register Phone Number",
      description: "Add the phone number you want to use for WhatsApp Business messaging.",
      icon: <Phone className="h-6 w-6 text-blue-500" />
    },
    {
      id: 5,
      title: "Send Test Message",
      description: "Verify your setup by sending a test message to ensure everything is working correctly.",
      icon: <MessageSquare className="h-6 w-6 text-purple-600" />
    },
    {
      id: 6,
      title: "Setup Complete",
      description: "Your WhatsApp Business API setup is now complete!",
      icon: <Check className="h-6 w-6 text-green-600" />
    }
  ];

  const progressValue = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">WhatsApp Business API Setup</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Follow these steps to connect your WhatsApp Business account and start messaging
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <Progress value={progressValue} className="h-2 [&>div]:bg-blue-500 bg-gray-200 dark:bg-gray-700" />
          <div className="flex justify-between mt-4">
            {steps.map(step => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${currentStep >= step.id ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${currentStep >= step.id ? "bg-blue-100 dark:bg-blue-700/20" : "bg-gray-200 dark:bg-gray-900"}`}>
                  {step.icon}
                </div>
                <span className="text-xs mt-1 font-medium">Step {step.id}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="p-6">
          {/* Step Header */}
          <div className="flex items-start mb-6">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${currentStep >= steps[currentStep - 1].id ? "bg-blue-100 dark:bg-blue-700/20" : "bg-gray-200 dark:bg-gray-900"}`}>
              {steps[currentStep - 1].icon}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {steps[currentStep - 1].description}
              </p>
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  To use WhatsApp Business API, you need to connect your Facebook Business Manager account. 
                  This allows us to manage your WhatsApp Business account and send messages on your behalf.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 p-4 rounded-md border ">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 ">Requirements</h3>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 list-disc list-inside">
                        <li>Facebook Business Manager account</li>
                        <li>Admin access to the business</li>
                        <li>Verified business domain (recommended)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                {facebookConnected ? (
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md border border-green-200 dark:border-green-700 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-green-700 dark:text-green-300">Facebook account connected successfully</span>
                  </div>
                ) : (
                  <Button
                    onClick={launchWhatsAppSignup}
                    disabled={isSaving || savingStatus || facebookConnected}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSaving  
                        ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Connecting...
                            </>
                            ) 
                        : savingStatus
                            ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Checking...
                                </>
                              ) 
                            : (
                                <>
                                    Connect WhatsApp Number
                                </>
                              )
                    }
                  </Button>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Business verification is required by Meta to ensure the authenticity of your business 
                  and to access advanced WhatsApp Business features.
                </p>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 p-4 rounded-md border">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Verification Process</h3>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 list-disc list-inside">
                        <li>Submit business documentation</li>
                        <li>Wait for Meta approval (typically 3-5 business days)</li>
                        <li>Receive verification status via email</li>
                      </ul>
                    </div>
                  </div>
                </div>
                {!manualVerification && (
                  <>
                    {/* ✅ Live Business Verification Status */}
                    <div className="p-4 rounded-md border bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                      {isVerifying && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Checking business verification status...
                        </div>
                      )}
                      {!isVerifying && (
                        <div className="flex items-center">
                          {status === "verified" ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span className="text-green-700 dark:text-green-400">
                                Business verification completed ✅
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                              <span className="text-yellow-700 dark:text-yellow-400 capitalize">
                                Current status: {status || "Pending"}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-3"
                                onClick={refresh}
                              >
                                Refresh
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                      {!isVerifying && error && (
                        <div className="text-red-600">Error: {error}</div>
                      )}
                    </div>

                    {/* If not verified → show form */}
                    {status !== "verified" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Business Name
                            </label>
                            <Input placeholder="Your official business name" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Business ID
                            </label>
                            <Input placeholder="Tax ID or registration number" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Business Address
                          </label>
                          <Input placeholder="Registered business address" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Website URL
                          </label>
                          <Input placeholder="https://yourbusiness.com" />
                        </div>
                        <Button
                          onClick={handleVerifyBusiness}
                          disabled={isSaving}
                          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting for verification...
                            </>
                          ) : (
                            "Submit for Verification"
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
                <Button
                  onClick={handleVerifyBusiness}
                  asChild
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                >
                  <Link
                    href="https://business.facebook.com/settings/info"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Verify Facebook Business Manually
                  </Link>
                </Button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Adding a valid payment method is required in Meta Business Manager 
                  to continue sending WhatsApp Business messages.
                </p>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 p-4 rounded-md border">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Payment Setup
                      </h3>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 list-disc list-inside">
                        <li>Open Meta Business Manager</li>
                        <li>Add a valid credit card or payment method</li>
                        <li>Save and confirm setup</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Manual Method → Add Payment Method */}
                <Button
                  asChild
                  disabled={isLoading}
                  onClick={handleAddPaymentMethod}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                >
                  <Link
                    href="https://business.facebook.com/billing_hub/accounts/details/?account_type=whatsapp-business-account"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {isLoading 
                     ? ("Loading...")
                     : ("Add Payment Method in Meta Business Manager")
                    }
                  </Link>
                </Button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Register the phone number you want to use for WhatsApp Business. This number will be 
                  associated with your business account and used for all messaging.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md border border-blue-200 dark:border-blue-700">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Number Requirements</h3>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 list-disc list-inside">
                        <li>Must be a valid phone number with country code</li>
                        <li>Should not be currently used with WhatsApp</li>
                        <li>Will receive a verification code</li>
                      </ul>
                    </div>
                  </div>
                </div>
                { phoneNumberIsRegistered 
                  ? (
                      <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md border border-green-200 dark:border-green-700 flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-green-700 dark:text-green-300">Phone Number is registered successfully</span>
                      </div>
                    ) 
                  : (
                      <Button
                        onClick={() => registerPhoneNumber()}
                        disabled={ isLoading_register }
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isLoading_register ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering Number...
                          </>
                        ) : (
                          "Register Phone Number"
                        )}
                      </Button>
                    )
                }
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Send a test message to verify that your WhatsApp Business API setup is working correctly.
                  </p>

                  <div className="grid gap-3">
                    <Label htmlFor="to">Phone</Label>
                    <Controller
                      name="to"
                      control={control}
                      render={({ field }) => (
                        <ShadcnPhoneInput
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {errors.to && <p className="text-sm text-red-500">{errors.to.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="message">Test Message</Label>
                    <Controller
                      name="message"
                      control={control}
                      render={({ field }) => (
                        <Input
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</h3>
                    <div className="bg-white dark:bg-gray-900 p-3 rounded border">
                      <p className="text-gray-800 dark:text-gray-200">{preview.message}</p>
                      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                        <span>To: {preview.to}</span>
                        <span>Now</span>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting || isLoading}>
                    {isSubmitting || isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Test Message...
                      </>
                    ) : (
                      "Send Test Message"
                    )}
                  </Button>
                </form>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6 text-center py-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Setup Complete!
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400">
                  Your WhatsApp Business API has been successfully configured. You can now start using WhatsApp for your business communications.
                </p>
                
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md border border-green-200 dark:border-green-700">
                  <p className="text-green-700 dark:text-green-300">
                    Redirecting to dashboard in 3 seconds...
                  </p>
                </div>
                
                <Button 
                  onClick={() => router.push("/dashboard")} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Go to Dashboard Now
                </Button>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          {currentStep !== 6 && (
            <div className="flex justify-between pt-4 border-t">
              <Button
                onClick={handleBack}
                disabled={currentStep === 1 || isLoading}
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !facebookConnected) ||
                    (currentStep === 2 && !businessVerified)  ||
                    (currentStep === 3 && !addPaymentMethod)  ||
                    (currentStep === 4 && !phoneNumberIsRegistered) ||
                    (currentStep === 5 && !testMessageSent) ||
                    isLoading
                  }
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteSetup}
                  disabled={!testMessageSent}
                >
                  Complete Setup
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Setup Tips - Only show if not on completion screen */}
        {currentStep !== 6 && (
          <Card className="p-6 mt-6">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Setup Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Use a dedicated business phone number for WhatsApp</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Ensure your Facebook Business Manager is fully set up before starting</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Have your business verification documents ready</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>The entire process may take several days due to Meta's verification</span>
              </li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}