import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import Contact from "@/models/Contact";
import { ApiResponse } from "@/types/apiResponse";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

// ✅ Update a contact
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      const response: ApiResponse = {
        success: false,
        message: "Unauthorized",
      };
      return NextResponse.json(response, { status: 401 });
    }

    // ⬅️ Await params because it’s a Promise
    const { id } = await params
    const { name, phones, email, tags } = await req.json()

    if (!name || !phones?.length) {
      const response: ApiResponse = {
        success: false,
        message: "Name and at least one phone number are required",
      };
      return NextResponse.json(response, { status: 400 });
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

    const contact = await Contact.findOneAndUpdate(
      { _id: id, userId: user._id },
      { name, phones, email, tags: tags || [] },
      { new: true }
    );

    if (!contact) {
      const response: ApiResponse = {
        success: false,
        message: "Contact not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: "Contact updated successfully",
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

// ✅ Delete a contact
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      const response: ApiResponse = {
        success: false,
        message: "Unauthorized",
      };
      return NextResponse.json(response, { status: 401 });
    }

    // ⬅️ Await params because it’s a Promise
    const { id } = await params

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).select("_id");
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const contact = await Contact.findOneAndDelete({ _id: id, userId: user._id });
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
