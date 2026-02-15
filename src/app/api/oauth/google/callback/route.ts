import { upsertTool } from "@/services/ai/tools/comman/upsertTool";
import { getToolById } from "@/services/ai/tools/data/toolsList";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { importGoogleContacts } from "@/services/contacts/importGoogleContacts";
import { GoogleService } from "@/types/OAuth";
import { ToolCatalog, ToolPayload, ToolStatus } from "@/types/Tool";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await fetchAuthenticatedUser();
  if (errorResponse) {
    return NextResponse.redirect(
      new URL(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ai?error=unauthorized`, req.url)
    );
  }

  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code");
  const serviceName = searchParams.get("state") as GoogleService;

  // ❌ always redirect instead of JSON
  if (!code || !serviceName) {
    return NextResponse.redirect(
      new URL(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ai?error=missing_code`, req.url)
    );
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    // // =========================
    // // CONTACTS → import
    // // =========================
    if (serviceName === GoogleService.CONTACTS_IMPORT) {
      const importedCount = await importGoogleContacts({
        userId: user._id,
        waAccountId: user.defaultWaAccountId,
        tokens,
      });
      return NextResponse.redirect(
        new URL(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contacts?imported=true&count=${importedCount}`, req.url)
      );
    } else {
      const tool: ToolCatalog | undefined = getToolById(serviceName);

      if (!tool) {
        return NextResponse.redirect(
          new URL(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ai?error=tool_not_found`, req.url)
        );
      }

      const toolPayload: ToolPayload = {
        id: tool.id,
        name: tool.name,
        category: tool.category,
        active: true,
        status: ToolStatus.CONNECTED,
        credentials: {
          calendarId: "primary",
          access_token: tokens.access_token ?? "",
          refresh_token: tokens.refresh_token ?? "",
          expiry_date: String(tokens.expiry_date ?? ""),
          scope: tokens.scope ?? "",
        },
      };

      await upsertTool({
        userId: user._id,
        waAccountId: user.defaultWaAccountId,
        tool: toolPayload,
      });

      return NextResponse.redirect(
        new URL(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ai?connected=${serviceName}`, req.url)
      );
    }
  } catch (e) {
    return NextResponse.redirect(
      new URL(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ai?error=oauth_failed`, req.url)
    );
  }
}

// `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contacts?imported=true&count=${importedCount}`