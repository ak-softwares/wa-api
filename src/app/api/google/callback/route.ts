import { google } from "googleapis";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { ApiResponse } from "@/types/apiResponse";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { User } from "@/models/User";
import Contact from "@/models/Contact";
import { IContact } from "@/types/Contact";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const response: ApiResponse = { success: false, message: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).select("_id");
    if (!user) {
      const response: ApiResponse = { success: false, message: "User not found" };
      return NextResponse.json(response, { status: 404 });
    }

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    if (!code) {
      const response: ApiResponse = { success: false, message: "No code provided" };
      return NextResponse.json(response, { status: 400 });
    }

    // Google OAuth setup
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const people = google.people({ version: "v1", auth: oauth2Client });

    // Fetch all contacts (with pagination)
    let allConnections: any[] = [];
    let nextPageToken: string | undefined = undefined;

    do {
      const res: any = await people.people.connections.list({
        resourceName: "people/me",
        personFields: "names,emailAddresses,photos,phoneNumbers",
        pageSize: 1000,
        pageToken: nextPageToken,
      });

      if (res.data.connections) {
        allConnections = allConnections.concat(res.data.connections);
      }

      nextPageToken = res.data.nextPageToken ?? undefined;
    } while (nextPageToken);

    // Map to contact structure
    let contactsToInsert: Partial<IContact>[] = allConnections.map((c) => ({
      userId: new mongoose.Types.ObjectId(user._id),
      name: c.names?.[0]?.displayName ?? undefined,
      email: c.emailAddresses?.[0]?.value ?? undefined,
      phones:
        c.phoneNumbers
          ?.map((p: any) => p.canonicalForm?.replace(/^\+/, "") || p.value)
          .filter((n: any): n is string => !!n) || [],
      imageUrl: c.photos?.[0]?.url ?? undefined,
    }));

    // Filter contacts without phone numbers
    contactsToInsert = contactsToInsert.filter((c) => c.phones && c.phones.length > 0);

    // Check for duplicates by phone
    const allPhones = contactsToInsert.flatMap((c) => c.phones || []);
    const existingContacts = await Contact.find({
      userId: user._id,
      phones: { $in: allPhones },
    }).select("phones");

    const existingPhones = new Set(existingContacts.flatMap((c) => c.phones || []));
    contactsToInsert = contactsToInsert.filter(
      (c) => !c.phones?.some((p) => existingPhones.has(p))
    );

    if (contactsToInsert.length > 0) {
      await Contact.insertMany(contactsToInsert, { ordered: false });
    }

    const importedCount = contactsToInsert.length;

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contacts?imported=true&count=${importedCount}`
    );
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: "Failed to import contacts",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
