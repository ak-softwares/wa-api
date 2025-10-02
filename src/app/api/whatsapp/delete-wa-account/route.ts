import { connectDB } from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import axios from "axios";

export async function DELETE(req: Request) {
  try {
    // get logged in user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      const response: ApiResponse = { success: false, message: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();

    // find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user || !user.waAccounts) {
      const response: ApiResponse = { success: false, message: "User WA account not found" };
      return NextResponse.json(response, { status: 404 });
    }

    const { phone_number_id, permanent_token, waba_id } = user.waAccounts;
    if (!phone_number_id || !permanent_token) {
      const response: ApiResponse = { success: false, message: "WA account not configured properly" };
      return NextResponse.json(response, { status: 400 });
    }

    // Step 1: Deregister phone number
    try {
      const deregisterUrl = `https://graph.facebook.com/v23.0/${phone_number_id}/deregister`;
      await axios.post(deregisterUrl, {}, {
        headers: { Authorization: `Bearer ${permanent_token}` }
      });
    } catch (err: any) {
      console.error("Deregister error:", err?.response?.data || err.message);
      // continue but log error
    }

    // Step 2: Unsubscribe webhook (requires waba_id or phone_number_id)
    try {
      if (waba_id) {
        const unsubscribeUrl = `https://graph.facebook.com/v23.0/${waba_id}/subscribed_apps`;
        await axios.delete(unsubscribeUrl, {
          headers: { Authorization: `Bearer ${permanent_token}` }
        });
      }
    } catch (err: any) {
      console.error("Unsubscribe error:", err?.response?.data || err.message);
      // continue but log error
    }

    // Step 3: Remove WA account data from DB
    user.waAccounts = undefined;
    await user.save();

    const response: ApiResponse = { success: true, message: "WA Account deregistered, unsubscribed, and deleted successfully" };
    return NextResponse.json(response, { status: 200 });

  } catch (err: any) {
    const response: ApiResponse = { success: false, message: err.message };
    return NextResponse.json(response, { status: 500 });
  }
}
