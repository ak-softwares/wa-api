"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function WhatsAppSignup() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [sdkResponse, setSdkResponse] = useState<any>(null);
  const [permanentToken, setPermanentToken] = useState<string>("Null");

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
    const listener = (event: MessageEvent) => {
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
            const { phone_number_id, waba_id } = data.data;
            console.log("Phone ID:", phone_number_id, "WABA ID:", waba_id);
          } else if (data.event === "CANCEL") {
            console.warn("User cancelled at:", data.data.current_step);
          } else if (data.event === "ERROR") {
            console.error("Error:", data.data.error_message);
          }
          setSessionInfo(data);
        }
      } catch {
        console.log("Non-JSON response", event.data);
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  const fbLoginCallback = (response: any) => {
    if (response.authResponse) {
      const code = response.authResponse.code;
      console.log("Auth Code:", code);
      // send {code, waba_id, phone_number_id} to your backend
    }
    setSdkResponse(response);
  };

  const launchWhatsAppSignup = () => {
    (window as any).FB.login(fbLoginCallback, {
      config_id: process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID,
      response_type: "code",
      override_default_response_type: true,
      extras: { version: "v3" },
    });
  };

  const getPermanentToken = async (code: string) => {
    if (!code) {
      toast.error("No auth code available");
      return;
    }

    try {
      const res = await fetch("/api/facebook/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code,
        }),
      });

      const tokenData = await res.json();

      if (res.ok && tokenData.success) {
        setPermanentToken(tokenData.data?.access_token || "");
        console.log("Permanent Token:", tokenData.data?.access_token);
        toast.success("Token exchange successful ✅");
      } else {
        toast.error("Token exchange failed: " + (tokenData.error?.message || tokenData.message));
        console.error("Token exchange failed:", tokenData);
      }
    } catch (err: any) {
      toast.error("Unexpected error: " + err.message);
      console.error("Unexpected error:", err);
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

      <button
        onClick={() => getPermanentToken(sdkResponse?.authResponse?.code)}
        className="px-6 py-3 text-white font-bold rounded-md bg-green-600 hover:bg-green-700"
      >
        Get permanent token
      </button>

      <div>
        <h3 className="font-bold">Permanent token:</h3>
        <pre className="bg-gray-100 p-2 text-sm rounded">
          {permanentToken}
        </pre>
      </div>
    </div>
  );
}
