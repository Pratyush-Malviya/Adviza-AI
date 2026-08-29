import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWorkflowFromPrompt } from "@/lib/agents/workflow-generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "A valid prompt string is required." },
        { status: 400 }
      );
    }

    const workflow = await generateWorkflowFromPrompt(prompt);

    return NextResponse.json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    console.error("Workflow Generation Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate workflow" },
      { status: 500 }
    );
  }
}
