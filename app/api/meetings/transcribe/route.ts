import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const meetingId = formData.get("meetingId") as string | null;
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || "audio/mp3";

    // 1. Transcribe audio using Google Gemini Multimodal Audio Model
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const promptText = `You are a professional wealth management transcriptionist.
Transcribe the attached audio recording of an advisory client meeting with high accuracy.
- Identify the speakers (e.g. "Advisor (David Miller):", "Client (Alexander Vance):").
- Capture all financial recommendations, portfolio numbers, tax details, asset classes, and action items verbatim.
- Output ONLY the clean structured transcript with speaker labels and timestamps if distinguishable.`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: promptText },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[transcribe-api] Gemini audio transcription error:", errText);
      throw new Error(`Audio transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    const transcriptText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!transcriptText) {
      throw new Error("No transcription text returned from audio analysis");
    }

    // 2. If meetingId provided, persist to Supabase
    if (meetingId) {
      await supabase
        .from("meetings")
        .update({
          transcript_text: transcriptText,
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", meetingId);
    }

    return NextResponse.json({
      success: true,
      transcript: transcriptText,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (err: any) {
    console.error("Audio transcription error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
