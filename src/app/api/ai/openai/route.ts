import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";

export async function POST(req: Request) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors
    
    // 2. Parse body
    const body = await req.json();
    const { messages } = body; 
    // e.g. messages: Array<{ role: "system" | "user" | "assistant"; content: string }>

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, message: "Invalid messages payload" },
        { status: 400 }
      );
    }

    const systemPrompt = waAccount.aiConfig?.prompt || "You are a helpful AI assistant.";

    // 4. Prepare OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // 5. Call OpenAI chat completion
    const resp = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // or whatever model you want
      user: user._id.toString(), // << unique user ID
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
      ],
    });

    const assistantMessage = resp.choices?.[0]?.message;

    if (!assistantMessage) {
      return NextResponse.json(
        { success: false, message: "No response from OpenAI" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Reply generated", data: assistantMessage },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
