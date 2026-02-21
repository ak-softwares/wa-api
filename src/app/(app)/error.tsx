"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h2 className="text-2xl font-semibold">Something went wrong</h2>

        <p className="text-gray-500">
          An unexpected error occurred. Please try again.
        </p>

        <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded text-left overflow-auto">
          {error.message}
        </pre>

        <div className="flex gap-3 justify-center">
          {/* Retry without full reload */}
          <Button onClick={() => reset()}>
            Try Again
          </Button>

          {/* Full page refresh */}
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
}