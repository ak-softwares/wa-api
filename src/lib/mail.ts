import { resend } from "@/lib/resend"; // make sure you configured resend SDK
import { ApiResponse } from "@/types/apiResponse";

interface SendMailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendMail({ to, subject, react }: SendMailOptions): Promise<ApiResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: "WA API <support@wa-api.me>",
      to: [to],
      subject,
      react,
    });

    if (error) {
      return { success: false, message: error.message || "Failed to send email" };
    }

    return { success: true, message: "Email sent successfully", data };
  } catch (err: any) {
    return { success: false, message: err.message || "Unexpected error" };
  }
}
