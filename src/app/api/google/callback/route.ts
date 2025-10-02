import { google } from "googleapis";
import { NextResponse } from "next/server";
import Contact, { IContact } from "@/models/Contact";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { ApiResponse } from "@/types/apiResponse";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const response: ApiResponse = { success: false, message: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).select("_id");
    if (!user) {
        const response: ApiResponse = {
            success: false,
            message: "User not found",
        };
        return NextResponse.json(response, { status: 404 });
    }

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    if (!code) {
      const response: ApiResponse = { success: false, message: "No code provided" };
      return NextResponse.json(response, { status: 400 });
    }

    // Google OAuth
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch contacts
    const people = google.people({ version: "v1", auth: oauth2Client });
    const res = await people.people.connections.list({
      resourceName: "people/me",
      personFields: "names,emailAddresses,photos,phoneNumbers",
      pageSize: 2,
    });

    const connections = res.data.connections || [];

    const contactsToInsert: Partial<IContact>[] = connections.map((c) => ({
      userId: new mongoose.Types.ObjectId(user._id),
      name: c.names?.[0]?.displayName ?? undefined,
      email: c.emailAddresses?.[0]?.value ?? undefined,
      phones: c.phoneNumbers
        ?.map((p) => p.canonicalForm?.replace(/^\+/, "") || p.value)
        .filter((n): n is string => !!n) || [],
      imageUrl: c.photos?.[0]?.url ?? undefined,
    }));

    await Contact.insertMany(contactsToInsert);

    // Redirect after successful import
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contacts?imported=true`);
  } catch (err: any) {
    const response: ApiResponse = { success: false, message: "Failed to import contacts" };
    return NextResponse.json(response, { status: 500 });
  }
}
