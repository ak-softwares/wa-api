import { NextRequest, NextResponse } from "next/server";
import { ContactModel } from "@/models/Contact";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { ImportedContact } from "@/types/Contact";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
   const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    // ⬅️ Await params because it’s a Promise
    const { id } = await params
    const body = await req.json();
    const contact: ImportedContact = body.contact;

    if (!contact.name || !contact.phones.length) {
      const response: ApiResponse = { success: false, message: "Name and at least one phone number are required"};
      return NextResponse.json(response, { status: 400 });
    }

    const existingContact = await ContactModel.findOneAndUpdate(
      { _id: id, userId: user._id },
      { name: contact.name, phones: contact.phones, email: contact.email, tags: contact.tags || [] },
      { new: true }
    );

    if (!existingContact) {
      const response: ApiResponse = { success: false, message: "Contact not found" };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: "Contact updated successfully",
      data: existingContact,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err?.message || "Unexpected error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// ✅ Delete a contact
export async function DELETE( req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors


    // ⬅️ Await params because it’s a Promise
    const { id } = await params

    const contact = await ContactModel.findOneAndDelete({ _id: id, userId: user._id });
    if (!contact) {
      const response: ApiResponse = {
        success: false,
        message: "Contact not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: "Contact deleted successfully",
      data: contact,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err?.message || "Unexpected error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
