import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";
import { ApiResponse } from "@/types/apiResponse";
import { NextResponse } from "next/server";
import Contact from "@/models/Contact";
import { IContact } from "@/types/Contact";  // <-- your contact type

export async function POST(req: Request) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const contacts: IContact[] = body.contacts;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Contacts array is required",
        },
        { status: 400 }
      );
    }

    // --- Split Contacts: valid + invalid ---
    const validContacts: IContact[] = [];
    const invalidContacts: IContact[] = [];

    contacts.forEach((c) => {
      if (!c.name || !c.phones || c.phones.length === 0) {
        invalidContacts.push(c);
      } else {
        validContacts.push(c);
      }
    });

    // --- Prepare documents for DB ---
    const docs = validContacts.map((c) => ({
      userId: user._id,
      waAccountId: waAccount._id,
      name: c.name,
      phones: c.phones,
      email: c.email || null,
      tags: c.tags || [],
    }));

    // --- Insert valid contacts only ---
    const inserted = docs.length > 0 ? await Contact.insertMany(docs) : [];

    // --- Final Response ---
    const response: ApiResponse = {
      success: true,
      message: "Bulk upload completed",
      data: {
        uploadedCount: inserted.length,
        skippedCount: invalidContacts.length,
        uploaded: inserted,
        skipped: invalidContacts,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error",
      },
      { status: 500 }
    );
  }
}
