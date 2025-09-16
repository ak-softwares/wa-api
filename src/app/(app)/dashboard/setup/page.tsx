"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useWhatsAppSignup } from "@/hooks/useWhatsAppAPISignup";
import { useBusinessVerification } from "@/hooks/useBusinessManagerVerification";
import { 
  Facebook, 
  CheckCircle, 
  Phone, 
  MessageSquare, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  Loader2
} from "lucide-react";

interface SetupStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function WhatsAppSetupPage() {
  const { launchWhatsAppSignup, facebookConnected, isSaving, isLoading: savingStatus } = useWhatsAppSignup();
  const { status, refresh, error } = useBusinessVerification();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessVerified: false,
    phoneNumber: "",
    message: "Hello! This is a test message from your WhatsApp Business API.",
    termsAgreed: false
  });

  useEffect(() => {
    if (facebookConnected) {
        handleNext();
    }
  }, [facebookConnected]);


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
      title: "Register Phone Number",
      description: "Add the phone number you want to use for WhatsApp Business messaging.",
      icon: <Phone className="h-6 w-6 text-blue-500" />
    },
    {
      id: 4,
      title: "Send Test Message",
      description: "Verify your setup by sending a test message to ensure everything is working correctly.",
      icon: <MessageSquare className="h-6 w-6 text-purple-600" />
    }
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConnectFacebook = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      handleInputChange("facebookConnected", true);
      setIsLoading(false);
    }, 2000);
  };

  const handleVerifyBusiness = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      handleInputChange("businessVerified", true);
      setIsLoading(false);
    }, 2000);
  };

  const handleRegisterNumber = () => {
    if (!formData.phoneNumber) {
      alert("Please enter a valid phone number");
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      handleNext();
    }, 2000);
  };

  const handleSendTestMessage = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert("Test message sent successfully! Your WhatsApp Business API is now ready to use.");
    }, 2000);
  };

  const progressValue = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Business API Setup</h1>
          <p className="text-gray-600 mt-2">
            Follow these steps to connect your WhatsApp Business account and start messaging
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <Progress value={progressValue} className="h-2 [&>div]:bg-blue-500" />
          <div className="flex justify-between mt-4">
            {steps.map(step => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${currentStep >= step.id ? "text-blue-600" : "text-gray-400"}`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${currentStep >= step.id ? "bg-blue-100" : "bg-gray-100"}`}>
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
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${currentStep >= steps[currentStep - 1].id ? "bg-blue-100" : "bg-gray-100"}`}>
              {steps[currentStep - 1].icon}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-gray-600 mt-1">
                {steps[currentStep - 1].description}
              </p>
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  To use WhatsApp Business API, you need to connect your Facebook Business Manager account. 
                  This allows us to manage your WhatsApp Business account and send messages on your behalf.
                </p>
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Requirements</h3>
                      <ul className="text-sm text-blue-700 mt-1 list-disc list-inside">
                        <li>Facebook Business Manager account</li>
                        <li>Admin access to the business</li>
                        <li>Verified business domain (recommended)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                {facebookConnected ? (
                  <div className="bg-green-50 p-4 rounded-md border border-green-200 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-green-700">Facebook account connected successfully</span>
                  </div>
                ) : (
                  <Button
                    onClick={launchWhatsAppSignup}
                    disabled={isSaving || savingStatus || facebookConnected}
                    className="w-full bg-blue-600 hover:bg-blue-700"
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
                <p className="text-gray-600">
                  Business verification is required by Meta to ensure the authenticity of your business 
                  and to access advanced WhatsApp Business features.
                </p>

                {/* Info Box */}
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Verification Process</h3>
                      <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                        <li>Submit business documentation</li>
                        <li>Wait for Meta approval (typically 3-5 business days)</li>
                        <li>Receive verification status via email</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* ✅ Live Business Verification Status */}
                <div className="p-4 rounded-md border bg-gray-50">
                  {isLoading && (
                    <div className="flex items-center text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Checking business verification status...
                    </div>
                  )}
                  {!isLoading && error && (
                    <div className="text-red-600">Error: {error}</div>
                  )}
                  {!isLoading && (
                    <div className="flex items-center">
                      {status === "verified" ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-green-700">Business verification completed ✅</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                          <span className="text-yellow-700 capitalize">
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
                </div>

                {/* If not verified → show form */}
                {status !== "verified" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Name
                        </label>
                        <Input placeholder="Your official business name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business ID
                        </label>
                        <Input placeholder="Tax ID or registration number" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Address
                      </label>
                      <Input placeholder="Registered business address" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website URL
                      </label>
                      <Input placeholder="https://yourbusiness.com" />
                    </div>
                    <Button
                      onClick={handleVerifyBusiness}
                      disabled={isSaving}
                      className="w-full bg-blue-600 hover:bg-blue-700"
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
              </div>
            )}


            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Register the phone number you want to use for WhatsApp Business. This number will be 
                  associated with your business account and used for all messaging.
                </p>
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Number Requirements</h3>
                      <ul className="text-sm text-blue-700 mt-1 list-disc list-inside">
                        <li>Must be a valid phone number with country code</li>
                        <li>Should not be currently used with WhatsApp</li>
                        <li>Will receive a verification code</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    placeholder="+1234567890"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include country code (e.g., +1 for US, +44 for UK)
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAgreed}
                    onCheckedChange={(checked) => handleInputChange("termsAgreed", checked)}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I confirm that I own this phone number and have permission to use it for business messaging
                  </label>
                </div>
                <Button
                  onClick={handleRegisterNumber}
                  disabled={isLoading || !formData.phoneNumber || !formData.termsAgreed}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering Number...
                    </>
                  ) : (
                    "Register Phone Number"
                  )}
                </Button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Send a test message to verify that your WhatsApp Business API setup is working correctly.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Message
                  </label>
                  <Input
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                  />
                </div>
                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-gray-800">{formData.message}</p>
                    <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                      <span>To: {formData.phoneNumber}</span>
                      <span>Now</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSendTestMessage}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Test Message...
                    </>
                  ) : (
                    "Send Test Message"
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              onClick={handleBack}
              disabled={currentStep === 1 || isLoading}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !facebookConnected) ||
                  (currentStep === 2 && !formData.businessVerified) ||
                  isLoading
                }
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => alert("Setup completed! Redirecting to dashboard...")}
                className="bg-green-600 hover:bg-green-700"
              >
                Complete Setup
              </Button>
            )}
          </div>
        </Card>

        {/* Setup Tips */}
        <Card className="p-6 mt-6">
          <h3 className="font-medium text-gray-900 mb-3">Setup Tips</h3>
          <ul className="space-y-2 text-sm text-gray-600">
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
      </div>
    </div>
  );
}