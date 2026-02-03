import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongoose";
import { UserModel } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { NextRequest, NextResponse } from "next/server";
import { hmacHash } from "@/lib/crypto";
import { WaAccountModel } from "@/models/WaAccount";
import { ApiTokenModel } from "@/models/ApiToken";
import { Types } from "mongoose";

export async function findUserIdByApiToken(token: string) {
  if (!token) return null;

  const hashed = hmacHash(token);

  const tokenDoc = await ApiTokenModel
    .findOne<{ userId: Types.ObjectId }>({ tokenHashed: hashed, isRevoked: false })
    .select("userId")
    .lean();

  return tokenDoc?.userId ?? null;
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

export async function fetchAuthenticatedUser(req?: NextRequest) {
  await connectDB();

    // 1️⃣ Try Bearer token first
  const { token } = getBearerToken(req);
  if (token) {
    const userId = await findUserIdByApiToken(token);

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: "Invalid or expired API token",
      };
      return { errorResponse: NextResponse.json(response, { status: 401 }) };
    }

    // 🔑 Fetch user from waAccount
    const user = await UserModel.findById(userId);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found for this API token",
      };
      return { errorResponse: NextResponse.json(response, { status: 404 }) };
    }

    // ✅ API-token case returns BOTH
    return { user };
  }
  
  // Try session-based authentication
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;

  if (!id) {
    const response: ApiResponse = { success: false, message: "Session not authenticated" };
    return { errorResponse: NextResponse.json(response, { status: 401 }) };
  }

  const user = await UserModel.findById(id);

  if (!user) {
    const response: ApiResponse = { success: false, message: "User not found", data: null };
    return { errorResponse: NextResponse.json(response, { status: 404 }) };
  }

  return { user };
}

export async function getDefaultWaAccount(req?: NextRequest) {
  
  // 2️⃣ Session-based auth (no Bearer token)
  const { user, errorResponse } = await fetchAuthenticatedUser(req);
  if (errorResponse) return { errorResponse };


  // 1️⃣ Check default WA account id
  if (!user.defaultWaAccountId) {
    const response: ApiResponse = { success: false, message: "No default WA account set" };
    return { errorResponse: NextResponse.json(response, { status: 404 }) };
  }

  // 2️⃣ Fetch WA account from its own collection
  const waAccount = await WaAccountModel.findOne({
    _id: user.defaultWaAccountId,
    userId: user._id, // security check
  });

  if (!waAccount) {
    const response: ApiResponse = { success: false, message: "Default WA account not found" };
    return { errorResponse: NextResponse.json(response, { status: 404 }) };
  }

  // Check token existence
  // console.log(waAccount.waba_id)
  // console.log(waAccount.permanent_token);
  if (!waAccount.permanent_token) {
    const response: ApiResponse = { success: false, message: "Permanent token not found" };
    return { errorResponse: NextResponse.json(response, { status: 400 }) };
  }

  return { user, waAccount };
}
