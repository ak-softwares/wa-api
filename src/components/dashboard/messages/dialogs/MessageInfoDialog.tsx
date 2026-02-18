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
import { Message } from "@/types/Message"
import { formatFullDateTime } from "@/utiles/formatTime/formatTime"

type Props = {
  open: boolean
  setOpen: (v: boolean) => void
  message: Message
}

const Row = ({
  icon,
  label,
  value,
  title,
  iconClassName,
}: {
  icon?: string
  label: string
  value?: string | null
  title?: string,
  iconClassName?: string;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon && 
        <img
          src={icon}
          className={`w-4 h-4 ${
            iconClassName || ""
          }`}
          alt={label}
          title={title}
        />
      }
      <span>{label}</span>
    </div>
    <span className="font-medium">
      {value ? formatFullDateTime(value) : "—"}
    </span>
  </div>
)

export default function MessageInfoDialog({ open, setOpen, message }: Props) {
  const isFailed = Boolean(message.failedAt)
  const isReceivedOnly = message.status === "received"

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
        <div className="rounded-lg border p-3 text-sm bg-muted/30">
          {message.message || "No text content"}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <Badge variant={"outline"}>
            {message.status}
          </Badge>
        </div>

        <Separator />

        <div className="space-y-3 text-sm">

          {/* FAILED */}
          {isFailed && (
            <Row
              icon="/assets/icons/warning.svg"
              label="Failed"
              value={message.failedAt}
              title={
                message.errorMessage
                  ? `Error: ${message.errorMessage}`
                  : "Message failed"
              }
            />
          )}

          {/* RECEIVED ONLY */}
          {isReceivedOnly && !isFailed && (
            <Row
              label="Received"
              value={message.createdAt}
            />
          )}

          {/* NORMAL FLOW */}
          {!isFailed && !isReceivedOnly && (
            <>
              <Row
                icon="/assets/icons/status-check.svg"
                label="Sent"
                value={message.sentAt}
                iconClassName="dark:invert opacity-60"
              />

              <Row
                icon="/assets/icons/status-dblcheck.svg"
                label="Delivered"
                value={message.deliveredAt}
                iconClassName="dark:invert opacity-60"
              />

              <Row
                icon="/assets/icons/status-dblcheck-1.svg"
                label="Read"
                value={message.readAt}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
