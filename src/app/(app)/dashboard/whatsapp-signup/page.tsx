"use client";

import { useState } from "react";
// import QRCode from "qrcode";

export default function WhatsAppPartnerQR() {
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateQR = async () => {
    setLoading(true);
    setQr(null);

    try {
      // ---- 1) CALL META GRAPH API UNSAFELY FROM CLIENT ----
      const res = await fetch(
        `https://graph.facebook.com/v20.0/1110802197690522/onboarding_requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SYSTEM_USER_TOKEN}`, // ⚠️ exposed
          },
          body: JSON.stringify({
            business_app_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
            phone_number: process.env.NEXT_PUBLIC_TARGET_PHONE, // number to onboard
          }),
        }
      );

      const data = await res.json();
      if (!data.onboarding_link) {
        alert("Error: " + JSON.stringify(data));
        setLoading(false);
        return;
      }

      // ---- 2) CONVERT ONBOARDING LINK TO QR ----
    //   const q = await QRCode.toDataURL(data.onboarding_link);
    //   setQr(q);
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-10 space-y-4">
      <h1 className="text-xl font-semibold">Generate WhatsApp Onboarding QR</h1>

      <button
        onClick={generateQR}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {loading ? "Generating..." : "Generate QR"}
      </button>

      {qr && <img src={qr} alt="WA Onboarding QR" className="mt-4 w-64" />}
    </div>
  );
}
