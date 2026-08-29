import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWorkflowFromPrompt } from "@/lib/agents/workflow-generator";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
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
