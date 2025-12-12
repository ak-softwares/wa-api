// components/chat/LocationMessage.tsx
"use client";

import React, { useState } from "react";
import { Message } from "@/types/Message";

interface LocationMessageProps {
  message: Message;
}

export default function LocationMessage({ message }: LocationMessageProps) {
  const lat = message.location?.latitude;
  const lng = message.location?.longitude;
  const name = message.location?.name || "Location";
  const address = message.location?.address || "";
  const fileName = name || "Location";
  const [error, setError] = useState(false); // ✅ track load errors
  const hasValidLocation = lat && lng;

  const mapUrl = hasValidLocation
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : undefined;

  const staticMap = hasValidLocation
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&markers=color:red|${lat},${lng}`
    : undefined;

  // ---------------- GLOBAL FALLBACK ----------------
  if (!hasValidLocation || error) {
    return (
      <div className="max-w-70 max-h-64 mb-2 -mx-2 -mt-1">
        <a href={mapUrl} target="_blank" rel="noopener noreferrer">
          <div className="w-70 h-35 dark:bg-[#1E6549] bg-[#B7E6CD] rounded-md flex items-center justify-center">
            <img
              src={"/assets/icons/location-icon.svg"}
              alt="location"
              className="w-15 h-15"
            />
          </div>
        </a>
        <p className="ml-1">{fileName}</p>
        {/* ADDRESS */}
        {address && (
          <p className="text-sm text-gray-600 dark:text-gray-300 pl-1">
            {address}
          </p>
        )}
      </div>
    );
  }

  // ---------------- MAIN LOCATION VIEW ----------------
  return (
    <div className="mb-2 -mx-2 -mt-1 w-70">
      {/* MAP PREVIEW */}
      <a href={mapUrl} target="_blank" rel="noopener noreferrer">
        <img
          src={staticMap}
          alt="location-map"
          className="rounded-md max-w-70 max-h-64 object-cover"
          onError={() => setError(true)} // fallback if load fails
        />
      </a>

      {/* TITLE */}
      <p className="font-semibold mt-2 pl-1">{name}</p>

      {/* ADDRESS */}
      {address && (
        <p className="text-sm text-gray-600 dark:text-gray-300 pl-1">
          {address}
        </p>
      )}
    </div>
  );
}
