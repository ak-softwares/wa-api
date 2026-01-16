import { ApiError } from "@/types/apiResponse";
import axios from "axios";

export function handleFacebookApiError(error: unknown, fallbackMessage: string): never {
  // ✅ Preserve business errors
  if (error instanceof ApiError) {
    throw error;
  }

  // ✅ Axios / Facebook error
  if (axios.isAxiosError(error)) {
    const fbError = error.response?.data?.error;

    const message =
      fbError?.error_user_title
        ? `${fbError.error_user_title}: ${fbError.error_user_msg}`
        : fbError?.error_user_msg ||
          fbError?.message ||
          fallbackMessage;

    const statusCode = error.response?.status || 400;

    throw new ApiError(statusCode, message);
  }

  // ❌ Unknown error
  throw new ApiError(500, fallbackMessage);
}
