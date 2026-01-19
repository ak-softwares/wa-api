import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { ContactModel, IContact } from "@/models/Contact";
import { ImportedContact } from "@/types/Contact";

// GET contacts (paginated, with optional search functionality)
export async function GET(req: NextRequest) {
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
      const matchConditions: any = {
        userId: user._id,
        waAccountId: waAccount._id,
      };
      const [searchResult] = await ContactModel.aggregate([
        { $match: matchConditions },

        // optional: sort fallback if name missing
        {
          $addFields: {
            sortName: { $ifNull: ["$name", ""] },
          },
        },

        { $sort: { sortName: 1 } },

        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $skip: skip }, { $limit: perPage }],
          },
        },
      ]);

      contacts = searchResult?.data || [];
      total = searchResult?.metadata?.[0]?.total || 0;
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
export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const body = await req.json();
    const contact: ImportedContact = body.contact;
    if (!contact.name || !contact.phones.length) {
      const response: ApiResponse = {
        success: false,
        message: "Name and at least one phone number are required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const newContact = await ContactModel.create({
      userId: user._id,
      waAccountId: waAccount._id,
      name: contact.name,
      phones: contact.phones,
      email: contact.email,
      tags: contact.tags || [],
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

export async function DELETE(req: NextRequest) {
  try {
    // ✅ Authenticated user
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse;

    // 🔐 Optional safety confirmation (recommended)
    const confirm = req.headers.get("x-confirm-delete-all");
    if (confirm !== "true") {
      const response: ApiResponse = {
        success: false,
        message: "Confirmation required to delete all chats",
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // ✅ Delete ALL contacts for this user
    const result = await ContactModel.deleteMany({
      userId: user._id,
      waAccountId: waAccount._id
    });

    if (result.deletedCount === 0) {
      const response: ApiResponse = {
        success: false,
        message: "No contacts found to delete",
      };
      return NextResponse.json(response, { status: 200 });
    }

    const response: ApiResponse = {
      success: true,
      message: `${result.deletedCount} contact(s) deleted successfully`,
      data: {
        deletedCount: result.deletedCount,
      },
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
