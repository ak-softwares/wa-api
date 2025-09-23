"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShadcnPhoneInput } from "@/components/ui/input"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSendWhatsappMessage } from "@/hooks/whatsapp/useSendWhatsappMessage"
import { sampleMessageSchema } from "@/schemas/sampleMessageSchema";
import z from "zod"

type SendMessageForm = z.infer<typeof sampleMessageSchema>;

export default function SendTestMessagePopup() {
  const [preview, setPreview] = useState({ to: "", message: "" })
  const [testMessageSent, setTestMessageSent] = useState(false)
  const { isLoading: isLoading_sendMessage, sendMessage } = useSendWhatsappMessage()

  const form = useForm<SendMessageForm>({
    resolver: zodResolver(sampleMessageSchema),
    defaultValues: preview,
  })

  const { handleSubmit, control, watch, formState: { errors, isSubmitting } } = form

  // Update preview dynamically
  watch((value) =>
    setPreview({
      to: value.to ?? "",
      message: value.message ?? "",
    })
  )

  const onSubmit = async (data: SendMessageForm) => {
    await sendMessage(
      data.to,
      data.message,
      () => {
        toast.success("Message sent successfully 🚀")
        setTestMessageSent(true)
      },
      (errorMsg) => {
        toast.error(errorMsg || "Failed to send message ❌")
      }
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Send Test Message</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send WhatsApp Test Message</DialogTitle>
          <DialogDescription>
            Send a test message to verify that your WhatsApp Business API setup is working correctly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid gap-3">
            <Label htmlFor="to">Phone</Label>
            <Controller
              name="to"
              control={control}
              render={({ field }) => (
                <ShadcnPhoneInput value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.to && <p className="text-sm text-red-500">{errors.to.message}</p>}
          </div>

          <div>
            <Label htmlFor="message">Test Message</Label>
            <Controller
              name="message"
              control={control}
              render={({ field }) => <Input value={field.value} onChange={field.onChange} />}
            />
            {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
          </div>

          {/* Preview */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</h3>
            <div className="bg-white dark:bg-gray-900 p-3 rounded border">
              <p className="text-gray-800 dark:text-gray-200">{preview.message}</p>
              <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                <span>To: {preview.to}</span>
                <span>Now</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={isSubmitting || isLoading_sendMessage}
          >
            {isSubmitting || isLoading_sendMessage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Test Message...
              </>
            ) : (
              "Send Test Message"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
