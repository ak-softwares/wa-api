"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "@/components/ui/sonner";
import { ApiResponse } from "@/types/apiResponse";

interface UseWhatsAppSignupReturn {
  launchWhatsAppSignup: () => void;
  facebookConnected: boolean;
  isSaving: boolean;
  isLoading: boolean;
}

/**
 * Hook to handle WhatsApp Embedded Signup via Facebook
 */
export function useWhatsAppSignup(): UseWhatsAppSignupReturn {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [sdkResponse, setSdkResponse] = useState<any>(null);
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // for initial check

    // ✅ Check existing Facebook connection on mount
  useEffect(() => {
    const checkFacebookConnection = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/whatsapp/check-status");
         const result: ApiResponse = await res.json()
        if (result.success && result.data.token) {
          setFacebookConnected(true);
          return;
        }
        else {
          setFacebookConnected(false);
        }
      } catch (err) {
        setFacebookConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkFacebookConnection();
  }, []);

  // ✅ Initialize FB SDK
  useEffect(() => {
    const checkFB = () => {
      if (typeof window !== "undefined" && (window as any).FB) {
        (window as any).FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          autoLogAppEvents: true,
          xfbml: true,
          version: "v23.0",
        });
      } else {
        setTimeout(checkFB, 500);
      }
    };
    checkFB();
  }, []);

  // ✅ Listen for Embedded Signup messages
  useEffect(() => {
    const listener = async (event: MessageEvent) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      ) return;

      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP") {
          if (data.event === "FINISH") {
            setSessionInfo(data);
          } else if (data.event === "CANCEL") {
            toast.error("User cancelled at: " + data.data.current_step);
          } else if (data.event === "ERROR") {
            toast.error("Facebook error: " + data.data.error_message);
          }
        }
      } catch {}
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  // ✅ Save account after FINISH
  useEffect(() => {
    const saveAccount = async () => {
      if (
        sessionInfo &&
        sdkResponse &&
        sessionInfo?.event === "FINISH" &&
        !facebookConnected
      ) {
        setIsSaving(true);

        const access_token = sdkResponse?.authResponse?.code;
        const { phone_number_id, waba_id, business_id } = sessionInfo?.data;

        try {
          const tokenData = await getPermanentTokenAndSaveWaAccount({
            phone_number_id,
            waba_id,
            business_id,
            access_token,
          });

          if (tokenData?.success) {
            toast.success("WhatsApp account registered successfully ✅");
          } else {
            toast.error(
              "Token exchange failed: " + (tokenData?.message || "Unknown error")
            );
          }
        } catch (err: any) {
          toast.error("Something went wrong: " + err.message);
        } finally {
          setFacebookConnected(true);
          setIsSaving(false);
        }
      }
    };

    saveAccount();
  }, [sessionInfo, sdkResponse, facebookConnected]);

  // ✅ FB login callback
  const fbLoginCallback = (response: any) => setSdkResponse(response);

  // ✅ Launch WhatsApp signup
  const launchWhatsAppSignup = useCallback(() => {
    setFacebookConnected(false);
    setSessionInfo(null);
    setSdkResponse(null);

    (window as any).FB.login(fbLoginCallback, {
      config_id: process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID,
      response_type: "code",
      override_default_response_type: true,
      extras: { version: "v3" },
    });
  }, []);

  // ✅ Exchange token + save WA account
  const getPermanentTokenAndSaveWaAccount = async ({
    phone_number_id,
    waba_id,
    business_id,
    access_token,
  }: {
    phone_number_id: string;
    waba_id: string;
    business_id: string;
    access_token: string;
  }) => {
    try {
      const res = await fetch("/api/whatsapp/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number_id,
          waba_id,
          business_id,
          access_token,
        }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  return { launchWhatsAppSignup, facebookConnected, isSaving, isLoading };
}
