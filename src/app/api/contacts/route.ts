import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import Contact from "@/models/Contact";
import { ApiResponse } from "@/types/apiResponse";
import { authOptions } from "../auth/[...nextauth]/authOptions";

// GET contacts (paginated with page & per_page)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      const response: ApiResponse = {
        success: false,
        message: "Unauthorized",
      };
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

    // Pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("per_page") || "10", 10);
    const skip = (page - 1) * perPage;

    const contacts = await Contact.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);

    const total = await Contact.countDocuments({ userId: user._id });

    const response: ApiResponse = {
      success: true,
      message: "Contacts fetched successfully",
      data: contacts,
      pagination: {
        total,
        page,
        perPage,
        pages: Math.ceil(total / perPage),
      },
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

// POST contact
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      const response: ApiResponse = {
        success: false,
        message: "Unauthorized",
      };
      return NextResponse.json(response, { status: 401 });
    }

    const { name, phone, email, tags } = await req.json();
    if (!name || !phone?.length) {
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

    const newContact = await Contact.create({
      userId: user._id,
      name,
      phone,
      email,
      tags: tags || [],
    });

    const response: ApiResponse = {
      success: true,
      message: "Contact created successfully",
      data: newContact,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err.message || "Unexpected error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
