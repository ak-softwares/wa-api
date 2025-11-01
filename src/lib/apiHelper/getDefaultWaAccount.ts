import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { NextRequest, NextResponse } from "next/server";

export function getBearerToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    const errorResponse = NextResponse.json(
      { success: false, message: "Missing Bearer token" },
      { status: 401 }
    );
    return { errorResponse };
  }

  return { token };
}

/**
 * ✅ Helper function to get authenticated user session and database record.
 * Handles authorization and database connection errors.
 */
export async function fetchAuthenticatedUser() {
  // 1️⃣ Check user session
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    const response: ApiResponse = { success: false, message: "Unauthorized", data: null };
    return { errorResponse: NextResponse.json(response, { status: 401 }) };
  }

  // 2️⃣ Connect to DB and fetch user
  await connectDB();
  const user = await User.findOne({ email });

  if (!user) {
    const response: ApiResponse = { success: false, message: "User not found", data: null };
    return { errorResponse: NextResponse.json(response, { status: 404 }) };
  }

  return { user };
}

/**
 * ✅ Get the authenticated user's default WhatsApp account.
 * Includes validation for waAccounts, default account, and token existence.
 */
export async function getDefaultWaAccount() {
  const { user, errorResponse } = await fetchAuthenticatedUser();
  if (errorResponse) return { errorResponse };

  // Check WhatsApp account list
  if (!user.waAccounts?.length) {
    const response: ApiResponse = { success: false, message: "No WA account found", data: null };
    return { errorResponse: NextResponse.json(response, { status: 404 }) };
  }

  // Get default WhatsApp account
  const waAccount = user.defaultWaAccount;
  if (!waAccount) {
    const response: ApiResponse = { success: false, message: "No default WA account", data: null };
    return { errorResponse: NextResponse.json(response, { status: 404 }) };
  }

  // Check token existence
  if (!waAccount.permanent_token) {
    const response: ApiResponse = { success: false, message: "Permanent token not found", data: null };
    return { errorResponse: NextResponse.json(response, { status: 400 }) };
  }

  return { user, waAccount };
}
