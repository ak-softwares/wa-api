"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Clock, CheckCheck } from "lucide-react"
import { Message } from "@/types/Message"
import { formatFullDateTime, formatTime } from "@/utiles/formatTime/formatTime"

type Props = {
  open: boolean
  setOpen: (v: boolean) => void
  message: Message
}

export default function MessageInfoDialog({ open, setOpen, message }: Props) {

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Message Info</DialogTitle>
          <DialogDescription>
            Delivery and read report details
          </DialogDescription>
        </DialogHeader>

        {/* Message preview */}
        <div className="rounded-lg border p-3 text-sm">
          {message.message || "No text content"}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{message.status}</Badge>
        </div>

        <Separator />

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <img
                src="/assets/icons/status-check.svg"
                className="w-4 h-4 dark:invert opacity-60"
                alt="sent/delivered"
              />
              <span>Sent</span>
            </div>
            <span className="font-medium">{message.sentAt ? formatFullDateTime(message.sentAt) : "—"}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <img
                src="/assets/icons/status-dblcheck.svg"
                className="w-4 h-4 dark:invert opacity-60"
                alt="sent/delivered"
              />
              <span>Delivered</span>
            </div>
            <span className="font-medium">{message.deliveredAt ? formatFullDateTime(message.deliveredAt) : "—"}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <img
                src="/assets/icons/status-dblcheck-1.svg"
                className="w-4 h-4"
                alt="read"
              />
              <span>Read</span>
            </div>
            <span className="font-medium">{message.readAt ? formatFullDateTime(message.readAt) : "—"}</span>
          </div>

          {message.failedAt && <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <img
                src="/assets/icons/warning.svg"
                className="w-4 h-4"
                alt="failed"
                title={message.errorMessage ? `Error: ${message.errorMessage}` : "Message failed"}
              />
              <span>Read</span>
            </div>
            <span className="font-medium">{message.failedAt ? formatFullDateTime(message.failedAt) : "—"}</span>
          </div>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
