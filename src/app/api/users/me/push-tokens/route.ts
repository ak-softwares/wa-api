import { NextRequest, NextResponse } from "next/server";
import { PushDeviceModel } from "@/models/PushDevice";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { ApiResponse } from "@/types/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const { deviceId, token } = await req.json();

    if (!deviceId || !token) {
      const response: ApiResponse = { success: false, message: "deviceId and token are required" };
      return NextResponse.json(response, { status: 400 });
    }

    await PushDeviceModel.findOneAndUpdate(
      { userId: user._id, deviceId },
      { token },
      { upsert: true, new: true }
    );

    const response: ApiResponse = {
      success: true,
      message: "Push device registered successfully",
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err.message || "Unexpected error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const { deviceId } = await req.json();

    await PushDeviceModel.deleteOne({
      userId: user._id,
      deviceId,
    });

    const response: ApiResponse = {
      success: true,
      message: "Device removed successfully",
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err.message || "Unexpected error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}