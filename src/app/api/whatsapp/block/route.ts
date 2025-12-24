import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";
import { ContactModel } from "@/models/Contact";
import { ChatParticipant } from "@/types/Chat";

export async function GET(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse;

    const blockedNumbers: string[] = waAccount.blockedNumbers || [];

    // Fetch contacts for all blocked numbers
    const contacts = await ContactModel.find({
      phones: { $in: blockedNumbers }
    }).lean();

    // Map results so that each blocked number returns a standardized Contact object
    const mappedBlocked: ChatParticipant[] = blockedNumbers.map((phone) => {
      const contact = contacts.find((c) => c.phones.includes(phone));
      return {
        name: contact?.name || null,
        imageUrl: contact?.imageUrl || null,
        number: phone,        // ensure phone is always present
      };
    });
    const response: ApiResponse = {
      success: true,
      message: "Fetched blocked contacts successfully",
      data: { blocked: mappedBlocked },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: `Error: ${error.message}`,
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// Add number to blocked list
export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse;

    const { number } = await req.json();
    if (!number) {
      return NextResponse.json(
        { success: false, message: "Number is required", data: null },
        { status: 400 }
      );
    }

    waAccount.blockedNumbers = waAccount.blockedNumbers || [];

    if (!waAccount.blockedNumbers.includes(number)) {
        waAccount.blockedNumbers.push(number);
        await user.save(); // IMPORTANT
    }

    return NextResponse.json(
      {
        success: true,
        message: "Number blocked successfully",
        data: { blocked: waAccount.blockedNumbers },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message, data: null },
      { status: 500 }
    );
  }
}

// Remove number from blocked list
export async function DELETE(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse;

    const { number } = await req.json();
    if (!number) {
      return NextResponse.json(
        { success: false, message: "Number is required", data: null },
        { status: 400 }
      );
    }

    waAccount.blockedNumbers = waAccount.blockedNumbers || [];
    waAccount.blockedNumbers = waAccount.blockedNumbers.filter((n: string) => n !== number);

    await user.save(); // IMPORTANT

    return NextResponse.json(
      {
        success: true,
        message: "Number removed from blocked list",
        data: { blocked: waAccount.blockedNumbers },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message, data: null },
      { status: 500 }
    );
  }
}