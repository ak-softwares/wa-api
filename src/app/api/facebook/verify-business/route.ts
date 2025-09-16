import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

// POST - Submit business for verification
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const response: ApiResponse = { 
        success: false, 
        message: "Unauthorized" 
      };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    
    // Get user from database
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Check if user has Facebook access token
    if (!user.facebookAccessToken) {
      const response: ApiResponse = {
        success: false,
        message: "Facebook account not connected. Please connect your Facebook Business account first.",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { businessName, businessId, businessAddress, websiteUrl } = await req.json();

    // Validate required fields
    if (!businessName || !businessId || !businessAddress) {
      const response: ApiResponse = {
        success: false,
        message: "Business name, ID, and address are required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Step 1: Get business manager ID
    const businessManagerId = await getBusinessManagerId(user.facebookAccessToken);
    
    if (!businessManagerId) {
      const response: ApiResponse = {
        success: false,
        message: "Could not find Business Manager account",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Step 2: Create business verification request
    const verificationRequestId = await createVerificationRequest(
      user.facebookAccessToken,
      businessManagerId,
      {
        businessName,
        businessId,
        businessAddress,
        websiteUrl
      }
    );

    if (!verificationRequestId) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to create verification request",
      };
      return NextResponse.json(response, { status: 500 });
    }

    // Step 3: Update user with verification info
    user.businessVerification = {
      status: "pending",
      requestId: verificationRequestId,
      submittedAt: new Date(),
      businessName,
      businessId,
      businessAddress,
      websiteUrl
    };

    await user.save();

    const response: ApiResponse = {
      success: true,
      message: "Business verification submitted successfully",
      data: {
        requestId: verificationRequestId,
        status: "pending"
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (err: any) {
    console.error("Business verification error:", err);
    
    const response: ApiResponse = {
      success: false,
      message: err.message || "Failed to submit business verification",
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// GET - Check verification status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const response: ApiResponse = { 
        success: false, 
        message: "Unauthorized" 
      };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // ✅ Ensure user has a permanent token + business ID
    if (!user.waAccounts?.permanent_token || !user.waAccounts?.business_id) {
      const response: ApiResponse = {
        success: false,
        message: "No verification request found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // ✅ Call Facebook API with permanent token + business ID
    const verificationStatus = await checkVerificationStatus(
      user.waAccounts.permanent_token,
      user.waAccounts.business_id
    );

    // ✅ Update stored status if changed
    if (!user.businessVerification) {
      user.businessVerification = {
        status: verificationStatus,
        updatedAt: new Date(),
      };
    } else if (verificationStatus !== user.businessVerification.status) {
      user.businessVerification.status = verificationStatus;
      user.businessVerification.updatedAt = new Date();
    }

    await user.save();

    const response: ApiResponse = {
      success: true,
      message: "Verification status retrieved",
      data: {
        status: verificationStatus,
        details: user.businessVerification,
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (err: any) {
    console.error("Verification status check error:", err);
    
    const response: ApiResponse = {
      success: false,
      message: err.message || "Failed to check verification status",
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}


// Helper function to get Business Manager ID
async function getBusinessManagerId(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/me/businesses?access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data[0].id; // Return the first business manager ID
    }

    return null;
  } catch (error) {
    console.error("Error getting business manager ID:", error);
    return null;
  }
}

// Helper function to create verification request
async function createVerificationRequest(
  accessToken: string, 
  businessManagerId: string, 
  businessData: {
    businessName: string;
    businessId: string;
    businessAddress: string;
    websiteUrl?: string;
  }
): Promise<string | null> {
  try {
    const formData = new FormData();
    
    // Add business information to form data
    formData.append("business", JSON.stringify({
      name: businessData.businessName,
      id: businessData.businessId,
      address: {
        street: businessData.businessAddress,
        // Note: Facebook may require more detailed address information
      },
      website: businessData.websiteUrl
    }));

    const response = await fetch(
      `https://graph.facebook.com/v17.0/${businessManagerId}/business_verification_requests?access_token=${accessToken}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Facebook verification error:", errorData);
      throw new Error(errorData.error?.message || "Failed to create verification request");
    }

    const data = await response.json();
    return data.id || null;

  } catch (error) {
    console.error("Error creating verification request:", error);
    return null;
  }
}

// Helper function to check verification status
async function checkVerificationStatus(
  accessToken: string,
  businessId: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${businessId}?fields=verification_status`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.verification_status || "unknown";

  } catch (error) {
    return "error";
  }
}
