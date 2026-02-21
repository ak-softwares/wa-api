"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWhatsAppSignup } from "@/hooks/SetupPageHooks/useWhatsAppAPISignup";
import {
  Facebook,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SetupStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function WhatsAppSetupPage() {
  const router = useRouter();
  const {
    launchWhatsAppSignup,
    facebookConnected,
    isSaving,
    isLoading: savingStatus,
  } = useWhatsAppSignup();

  const [currentStep, setCurrentStep] = useState(1);

  const steps: SetupStep[] = [
    {
      id: 1,
      title: "Connect Facebook Account",
      description:
        "Link your Facebook Business Manager account to get started with WhatsApp Business API.",
      icon: <Facebook className="h-6 w-6 text-blue-600" />,
    },
  ];

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

  const handleCompleteSetup = () => {
    router.push("/dashboard");
  };

  const isLastStep = currentStep === steps.length;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 dark:bg-[#161717]">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            WhatsApp Business API Setup
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Follow these steps to connect your WhatsApp Business account and
            start messaging.
          </p>
        </div>

        <Card className="p-6">
          {/* Step Header */}
          <div className="flex items-start mb-6">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center
                ${
                  currentStep >= steps[currentStep - 1].id
                    ? "bg-blue-100 dark:bg-blue-700/20"
                    : "bg-gray-200 dark:bg-gray-900"
                }`}
            >
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
          {currentStep === 1 && (
            <div className="space-y-4 mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                To use WhatsApp Business API, connect your Facebook Business
                Manager account. This allows us to manage your WhatsApp Business
                account and send messages on your behalf.
              </p>

              {/* Requirement Box */}
              <div className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 p-4 rounded-md border">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Requirements
                    </h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 list-disc list-inside">
                      <li>Facebook Business Manager account</li>
                      <li>Admin access to the business</li>
                      <li>Verified business domain (recommended)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Connection Status */}
              {facebookConnected ? (
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md border border-green-200 dark:border-green-700 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-green-700 dark:text-green-300">
                    Facebook account connected successfully
                  </span>
                </div>
              ) : (
                <Button
                  onClick={launchWhatsAppSignup}
                  disabled={isSaving || savingStatus}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : savingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Connect WhatsApp Number"
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            {/* Back Button */}
            <Button
              onClick={handleBack}
              disabled={currentStep === 1}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {/* Next / Complete Button */}
            {isLastStep ? (
              <Button onClick={handleCompleteSetup}>
                Complete Setup
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!facebookConnected}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>

        {/* Tips */}
        <Card className="p-6 mt-6">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
            Setup Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
              <span>Use a dedicated business phone number for WhatsApp.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
              <span>
                Ensure your Facebook Business Manager is fully set up before
                starting.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
              <span>Have your business verification documents ready.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
              <span>
                The entire process may take a few days due to Meta’s
                verification.
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
