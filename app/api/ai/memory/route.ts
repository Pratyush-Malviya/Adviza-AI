import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllMemories, searchMemories, deleteMemory, addMemories, generateEmbedding } from "@/lib/memory/mem0";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (query && query.trim().length > 0) {
      const memories = await searchMemories(user.id, query.trim(), 10);
      return NextResponse.json({ memories });
    }

    const memories = await getAllMemories(user.id);
    return NextResponse.json({ memories });
  } catch (err: any) {
    console.error("GET /api/ai/memory error:", err);
    return NextResponse.json({ error: err.message || "Failed to retrieve memories" }, { status: 500 });
  }
}

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

    const body = await req.json();
    const memoryText = body.memory;
    const category = body.category || "general";

    if (!memoryText || typeof memoryText !== "string" || memoryText.trim().length < 3) {
      return NextResponse.json({ error: "Valid memory text required" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("firm_id")
      .eq("id", user.id)
      .single();

    const embedding = await generateEmbedding(memoryText.trim());

    const { data: inserted, error } = await supabase
      .from("user_memories")
      .insert({
        user_id: user.id,
        firm_id: profile?.firm_id,
        category,
        memory: memoryText.trim(),
        metadata: {
          manual: true,
          added_at: new Date().toISOString(),
          ...(embedding ? { embedding } : {}),
        },
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ memory: inserted });
  } catch (err: any) {
    console.error("POST /api/ai/memory error:", err);
    return NextResponse.json({ error: err.message || "Failed to save memory" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const memoryId = body.memoryId;

    if (!memoryId) {
      return NextResponse.json({ error: "memoryId is required" }, { status: 400 });
    }

    const success = await deleteMemory(user.id, memoryId);

    return NextResponse.json({ success, deletedMemoryId: memoryId });
  } catch (err: any) {
    console.error("DELETE /api/ai/memory error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete memory" }, { status: 500 });
  }
}
