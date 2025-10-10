import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

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

    // 3. (Optional) you could load user’s aiConfig, or user-specific context
    await connectDB();
    const user = await User.findOne({ email: session.user.email }).select("aiConfig");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const systemPrompt = user.aiConfig?.prompt || "You are a helpful AI assistant.";

    // 4. Prepare OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // 5. Call OpenAI chat completion
    const resp = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // or whatever model you want
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
