"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession, getSession } from "next-auth/react";

 
export default function WhatsAppSignup() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [sdkResponse, setSdkResponse] = useState<any>(null);
  const [savedWaAccount, setSavedWaAccount] = useState<boolean>(false);
  const { data: session } = useSession();

  useEffect(() => {
    // Only run on client, after FB SDK script has loaded
    const checkFB = () => {
      if (typeof window !== "undefined" && (window as any).FB) {
        (window as any).FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          autoLogAppEvents: true,
          xfbml: true,
          version: "v21.0", // ✅ must be a valid version
        });
      } else {
        // Retry until FB is available
        setTimeout(checkFB, 500);
      }
    };

    checkFB();

    // Listen for Embedded Signup messages
    // Listener (only stores WhatsApp account info, no API calls here)
    const listener = async (event: MessageEvent) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      ) {
        return;
      }

      try {
        const data = JSON.parse(event.data);

        if (data.type === "WA_EMBEDDED_SIGNUP") {
          if (data.event === "FINISH") {
            setSessionInfo(data); // ✅ store for later use in fbLoginCallback
          } else if (data.event === "CANCEL") {
            toast.error("User cancelled at: " + data.data.current_step);
          } else if (data.event === "ERROR") {
            toast.error("Facebook error: " + data.data.error_message);
          }
        }
      } catch (err: any) {
        // toast.error("Unexpected error: " + err.message);
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  // ✅ Wait for both before calling API
  useEffect(() => {
    const saveAccount = async () => {
      if (sessionInfo && sdkResponse && sessionInfo?.event === "FINISH" && !savedWaAccount && session) {
        const userEmail = session.user?.email;
        if (!userEmail) {
          toast.error("User email not found in session");
          return;
        }
        const access_token = sdkResponse?.authResponse?.code; // code for exchange
        const { phone_number_id, waba_id, business_id } = sessionInfo?.data;
        try {
          const tokenData = await getPermanentTokenAndSaveWaAccount({
            userEmail,
            phone_number_id,
            waba_id,
            business_id,
            access_token,
          });

          if (tokenData?.success) {
            toast.success("WhatsApp account registered successfully ✅");
          } else {
            toast.error(
              "Token exchange failed: " +
                (tokenData?.message || "Unknown error")
            );
          }
        } catch (err: any) {
          toast.error("Something went wrong: " + err.message);
        } finally {
          // Reset to avoid duplicate calls
          setSavedWaAccount(true);
        }
      }
    };

    saveAccount();
  }, [sessionInfo, sdkResponse, session]);


  const fbLoginCallback = (response: any) => {
    setSdkResponse(response);
  };

  const launchWhatsAppSignup = () => {
    setSavedWaAccount(false); // reset for new attempt
    setSessionInfo(null);
    setSdkResponse(null);
    (window as any).FB.login(fbLoginCallback, {
      config_id: process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID,
      response_type: "code",
      override_default_response_type: true,
      extras: { version: "v3" },
    });
  };

    // Exchange token + save account
    const getPermanentTokenAndSaveWaAccount = async ({
      userEmail,
      phone_number_id,
      waba_id,
      business_id,
      access_token,
    }: {
      userEmail: string;
      phone_number_id: string;
      waba_id: string;
      business_id: string;
      access_token: string;
    }) => {
      try {
        const res = await fetch("/api/facebook/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail,
            phone_number_id,
            waba_id,
            business_id,
            access_token,
          }),
        });

        return await res.json(); // return raw response to listener
      } catch (err: any) {
        return { success: false, message: err.message }; // return error instead of toast
      }
    };


  return (
    <div className="p-6 space-y-4">
      <button
        onClick={launchWhatsAppSignup}
        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700"
      >
        Login with Facebook
      </button>

      <div>
        <h3 className="font-bold">Session Info Response:</h3>
        <pre className="bg-gray-100 p-2 text-sm rounded">
          {JSON.stringify(sessionInfo, null, 2)}
        </pre>
      </div>

      <div>
        <h3 className="font-bold">SDK Response:</h3>
        <pre className="bg-gray-100 p-2 text-sm rounded w-[1000px] overflow-x-auto">
          {JSON.stringify(sdkResponse, null, 2)}
        </pre>
      </div>

    </div>
  );
}
