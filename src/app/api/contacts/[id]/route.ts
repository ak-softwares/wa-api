import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import Contact from "@/models/Contact";
import { ApiResponse } from "@/types/apiResponse";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

// ✅ Update a contact
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { name, phone, email, tags } = await req.json();

    if (!name || !phone?.length) {
      return NextResponse.json(
        { success: false, message: "Name and at least one phone number are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).select("_id");
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const contact = await Contact.findOneAndUpdate(
      { _id: id, userId: user._id },
      { name, phone, email, tags: tags || [] },
      { new: true }
    );

    if (!contact) {
      return NextResponse.json({ success: false, message: "Contact not found" }, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: "Contact updated successfully",
      data: contact,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Unexpected error" }, { status: 500 });
  }
}

// ✅ Delete a contact
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).select("_id");
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const contact = await Contact.findOneAndDelete({ _id: id, userId: user._id });
    if (!contact) {
      return NextResponse.json({ success: false, message: "Contact not found" }, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: "Contact deleted successfully",
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Unexpected error" }, { status: 500 });
  }
}
