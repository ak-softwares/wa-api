import { fetchAuthenticatedUser, getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { ApiResponse } from "@/types/apiResponse";
import { NextRequest, NextResponse } from "next/server";
import { ContactModel } from "@/models/Contact";
import { ImportedContact } from "@/types/Contact";

export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const contacts: ImportedContact[] = body.contacts;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      const response: ApiResponse = { success: false, message: "Contacts array is required" };
      return NextResponse.json(response, { status: 400 });
    }

    // --- Split Contacts: valid + invalid ---
    const validContacts: ImportedContact[] = [];
    const invalidContacts: ImportedContact[] = [];

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
    const inserted = docs.length > 0 ? await ContactModel.insertMany(docs) : [];

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
    const response: ApiResponse = { success: false, message: error.message || "Server error" };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // ✅ Authenticated user
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse;

    // ✅ Parse body
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: "No contact IDs provided",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // ✅ Delete all matching contacts belonging to the same user
    const result = await ContactModel.deleteMany({
      _id: { $in: ids }
      // userId: user._id,
    });

    if (result.deletedCount === 0) {
      const response: ApiResponse = {
        success: false,
        message: "No contacts found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: `${result.deletedCount} contact(s) deleted successfully`,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = { success: false, message: err?.message || "Unexpected error" };
    return NextResponse.json(response, { status: 500 });
  }
}
