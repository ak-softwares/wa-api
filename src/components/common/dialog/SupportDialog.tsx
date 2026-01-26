import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

import { Phone, Mail, Copy, MessageCircle } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SupportDialog({ open, onClose }: Props) {
  const phoneNumber = "+918077030731";
  const displayNumber = "+91 80770 30731";
  const email = "support@wa-api.me";
  const whatsappMessage = "Hi, I need help with my account.";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      toast.success("Support number copied!");
    } catch {
      toast.error("Failed to copy number");
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/${phoneNumber.replace("+", "")}?text=${encodeURIComponent(
        whatsappMessage
      )}`,
      "_blank"
    );
  };

  const handleEmail = () => {
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      "Support Request"
    )}&body=${encodeURIComponent("Hi Team,\n\nI need help with...\n")}`;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Help & Support
          </DialogTitle>
          <DialogDescription>
            Choose the best way to reach us. We’re here to help.
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="py-4 space-y-4">
          {/* Support Number Card */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-gray-900 dark:text-white" />
              </div>

              <div className="leading-tight">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Support Number
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {displayNumber}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleCopy}
              className="rounded-xl"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={handleCall}
              className="w-full rounded-2xl h-12 justify-start"
            >
              <Phone className="w-5 h-5 mr-3" />
              Call Support
            </Button>

            <Button
              onClick={handleWhatsApp}
              variant="outline"
              className="w-full rounded-2xl h-12 justify-start"
            >
              <MessageCircle className="w-5 h-5 mr-3" />
              Chat on WhatsApp
            </Button>

            <Button
              onClick={handleEmail}
              variant="outline"
              className="w-full rounded-2xl h-12 justify-start"
            >
              <Mail className="w-5 h-5 mr-3" />
              Email Support
            </Button>
          </div>

          {/* Footer Note */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
            Available Mon–Sat • Response time usually within 5–15 minutes
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
