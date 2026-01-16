"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePhoneCodeVerification } from "@/hooks/SetupPageHooks/usePhoneCodeVerification";

export function VerifyPhoneDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const [code, setCode] = useState("");
  const { verifyCode, verifyCodeLoading } = usePhoneCodeVerification();

  const handleVerify = async () => {
    const ok = await verifyCode(code);

    if (ok) {
      setOpen(false);
      setCode("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Enter Verification Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code..."
            maxLength={6}
          />

          <Button
            onClick={handleVerify}
            disabled={verifyCodeLoading}
            className="w-full"
          >
            {verifyCodeLoading ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
