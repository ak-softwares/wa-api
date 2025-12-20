import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { NextRequest, NextResponse } from "next/server";
import { hmacHash } from "@/lib/crypto";
import { WaAccount } from "@/models/WaAccount";

/**
 * Finds a WA account by plain (unencrypted) API token
 */
export async function findWaAccountByApiToken(token: string) {
  if (!token) return null;

  const hashed = hmacHash(token);

  return await WaAccount.findOne({ apiTokenHashed: hashed });
}


export function getBearerToken(req?: NextRequest) {
  const authHeader = req?.headers.get("authorization");
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
  await connectDB();

  // Try session-based authentication
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    const response: ApiResponse = { success: false, message: "Unauthorized", data: null };
    return { errorResponse: NextResponse.json(response, { status: 401 }) };
  }

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
export async function getDefaultWaAccount(req?: NextRequest) {
  
  // 1️⃣ Try Bearer token first
  const { token } = getBearerToken(req);
  if (token) {
    const waAccount = await findWaAccountByApiToken(token);

    if (!waAccount) {
      const response: ApiResponse = {
        success: false,
        message: "Invalid or expired API token",
      };
      return { errorResponse: NextResponse.json(response, { status: 401 }) };
    }

    // 🔑 Fetch user from waAccount
    const user = await User.findById(waAccount.userId);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found for this API token",
      };
      return { errorResponse: NextResponse.json(response, { status: 404 }) };
    }

    // Optional: ensure WA account is usable
    if (!waAccount.permanent_token) {
      const response: ApiResponse = {
        success: false,
        message: "Permanent token not found",
      };
      return { errorResponse: NextResponse.json(response, { status: 400 }) };
    }

    waAccount.apiTokenUpdatedAt = new Date();
    await waAccount.save();

    // ✅ API-token case returns BOTH
    return { user, waAccount };
  }

  // 2️⃣ Session-based auth (no Bearer token)
  const { user, errorResponse } = await fetchAuthenticatedUser();
  if (errorResponse) return { errorResponse };


  // 1️⃣ Check default WA account id
  if (!user.defaultWaAccountId) {
    const response: ApiResponse = { success: false, message: "No default WA account set" };
    return { errorResponse: NextResponse.json(response, { status: 404 }) };
  }

  // 2️⃣ Fetch WA account from its own collection
  const waAccount = await WaAccount.findOne({
    _id: user.defaultWaAccountId,
    userId: user._id, // security check
  });

  if (!waAccount) {
    const response: ApiResponse = { success: false, message: "Default WA account not found" };
    return { errorResponse: NextResponse.json(response, { status: 404 }) };
  }

  // Check token existence
  // console.log(waAccount.permanent_token);
  if (!waAccount.permanent_token) {
    const response: ApiResponse = { success: false, message: "Permanent token not found" };
    return { errorResponse: NextResponse.json(response, { status: 400 }) };
  }

  return { user, waAccount };
}
