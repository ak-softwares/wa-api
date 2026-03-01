import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { ApiTokenModel, IApiToken } from "@/models/ApiToken";
import { hmacHash } from "@/lib/crypto";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors
        
    const token = await ApiTokenModel.findOne({
      userId: user._id,
    }).select("-tokenHashed");

    if (!token) {
      return NextResponse.json({ success: false, message: "Token not found or unauthorized" }, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: "API token retrieved successfully",
      data: {   
        token: token,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err.message || "Failed to retrieve token",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors
    // Update user's API token at root level (since your User model has apiToken field)
    const rawToken = `wa_live_${crypto.randomBytes(32).toString("hex")}`;

    // ✅ single token per waAccount (update or create)
    const genratedToken = await ApiTokenModel.findOneAndUpdate(
      {
        userId: user._id,
      },
      {
        userId: user._id,
        name: "Default",
        tokenHashed: hmacHash(rawToken),
        permissions: ["send", "read"],
        isRevoked: false,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    const token: IApiToken = {
      _id: genratedToken._id, // needed for revoke later
      userId: user._id,
      waAccountId: user.defaultWaAccountId,
      name: "Default",
      token: rawToken, // raw shown once
      createdAt: genratedToken.createdAt,
    };
    
    const response: ApiResponse = {
      success: true,
      message: "New API token generated successfully",
      data: {
        token: token,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err.message || "Failed to generate token",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
