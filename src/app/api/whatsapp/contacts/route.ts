import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";
import { ContactModel, IContact } from "@/models/Contact";

// GET contacts (paginated, with optional search functionality)
export async function GET(req: Request) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    // Pagination + filters + search
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("per_page") || "10", 10);
    const searchQuery = searchParams.get("q") || "";
    const skip = (page - 1) * perPage;

    let contacts: IContact[] = [];
    let total = 0;

    // If search query exists, use MongoDB Atlas Search
    if (searchQuery) {
      const searchPipeline: any[] = [
        {
          $search: {
            index: "default", // Using the default index
            text: {
              query: searchQuery,
              path: {
                wildcard: "*" // Search across all fields
              }
            }
          }
        },
        {
          $match: {
            userId: user._id, // Filter by user after search
            waAccountId: waAccount._id
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $skip: skip },
              { $limit: perPage },
            ],
          },
        },
      ];

      const [searchResult] = await ContactModel.aggregate(searchPipeline);
      contacts = searchResult?.data || [];
      total = searchResult?.metadata?.[0]?.total || 0;
    } else {
      // Regular paginated query without search
      const query = { userId: user._id, waAccountId: waAccount._id };

      [contacts, total] = await Promise.all([
        ContactModel.find(query)
          .sort({ name: 1 })
          .skip(skip)
          .limit(perPage),
        ContactModel.countDocuments(query),
      ]);
    }

    const response: ApiResponse = {
      success: true,
      message: searchQuery 
        ? "Contacts searched successfully" 
        : "Contacts fetched successfully",
      data: contacts,
      pagination: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
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
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { name, phones, email, tags } = await req.json();
    if (!name || !phones?.length) {
      const response: ApiResponse = {
        success: false,
        message: "Name and at least one phone number are required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const newContact = await ContactModel.create({
      userId: user._id,
      waAccountId: waAccount._id,
      name,
      phones,
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
