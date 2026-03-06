import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { TemplateModel } from "@/models/Template";
import { TemplatesModule } from "@/services/whatsappApi/modules/TemplatesModule";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { waba_id, permanent_token } = waAccount;

    const { name } = await params;
    if (!name) {
      const response: ApiResponse = {
        success: false,
        message: "Template name is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const templatesModule = new TemplatesModule({
      waba_id,
      permanent_token,
    });

    const fbResponse = await templatesModule.deleteTemplate(name);

    /* ------------------------------------------------------------
    * 2️⃣ DELETE TEMPLATE FROM DATABASE
    * ------------------------------------------------------------ */
    const dbDelete = await TemplateModel.findOneAndDelete({
      userId: user._id,
      waAccountId: waAccount._id,
      name: name
    });

    const response: ApiResponse = {
      success: true,
      message: "Template deleted successfully from Facebook and database",
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}


export async function PUT(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { waba_id, permanent_token } = waAccount;

    // Parse request
    const { id, name, category, language, components } = await req.json();
    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: "Template ID is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!name || !category || !language || !components) {
      const response: ApiResponse = {
        success: false,
        message: "Missing required fields ( name, category, language, components )",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const templatesModule = new TemplatesModule({
      waba_id,
      permanent_token,
    });

    const fbResponse = await templatesModule.updateTemplate({
      id,
      name,
      category,
      language,
      components,
    });

    // Update DB template
    const updatedTemplate = await TemplateModel.findOneAndUpdate(
      {
        id: id,
        userId: user._id,
        // waAccountId: waAccount._id,
      },
      {
        name,
        category,
        language,
        components,
        updatedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
      }
    );

    const response: ApiResponse = {
      success: true,
      message: "Template updated successfully",
      data: updatedTemplate,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}