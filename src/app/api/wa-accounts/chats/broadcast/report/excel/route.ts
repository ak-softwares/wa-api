import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import ExcelJS from "exceljs";

import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { MessageModel } from "@/models/Message";
import { ApiResponse } from "@/types/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);

    const chatId = searchParams.get("chatId");
    const messageId = searchParams.get("messageId"); // optional

    if (!chatId || !messageId) {
      const response: ApiResponse = { success: false, message: "Missing chatId or messageId" };
      return NextResponse.json(response, { status: 400 });
    }

    const chatObjectId = new Types.ObjectId(chatId);
    const masterMessageId = new Types.ObjectId(messageId);

    // ✅ fetch ALL report rows (no pagination)
    const rows = await MessageModel.find({
      userId: user._id,
      chatId: chatObjectId,
      parentMessageId: masterMessageId,
      isBroadcastMaster: false,
    })
      .sort({ createdAt: -1 })
      .select({
        to: 1,
        status: 1,
        waMessageId: 1,
        sentAt: 1,
        deliveredAt: 1,
        readAt: 1,
        failedAt: 1,
        errorMessage: 1,
        createdAt: 1,
      })
      .lean();

    // ============================================================
    // ✅ Build Excel
    // ============================================================
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Broadcast Report");

    sheet.columns = [
      { header: "#", key: "sr", width: 6 },
      { header: "Number", key: "to", width: 20 },
      { header: "Status", key: "status", width: 14 },
      { header: "FB Accepted", key: "fbAccepted", width: 14 },
      { header: "Sent At", key: "sentAt", width: 20 },
      { header: "Delivered At", key: "deliveredAt", width: 20 },
      { header: "Read At", key: "readAt", width: 20 },
      { header: "Failed At", key: "failedAt", width: 20 },
      { header: "Error", key: "errorMessage", width: 35 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    rows.forEach((r, index) => {
      sheet.addRow({
        sr: index + 1,
        to: r.to || "",
        status: r.status || "",
        fbAccepted: r.sentAt ? "Yes" : "No",
        sentAt: r.sentAt ? new Date(r.sentAt).toLocaleString() : "",
        deliveredAt: r.deliveredAt ? new Date(r.deliveredAt).toLocaleString() : "",
        readAt: r.readAt ? new Date(r.readAt).toLocaleString() : "",
        failedAt: r.failedAt ? new Date(r.failedAt).toLocaleString() : "",
        errorMessage: r.errorMessage || "",
        createdAt: r.createdAt ? new Date(r.createdAt).toLocaleString() : "",
      });
    });

    // style header
    sheet.getRow(1).font = { bold: true };

    // create buffer
    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = `broadcast-report-${chatId}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
