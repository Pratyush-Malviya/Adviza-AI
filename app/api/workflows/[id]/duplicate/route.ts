import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const newId = "wf_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);

    if (user) {
      const { data: original } = await (supabase as any)
        .from("workflows")
        .select("*")
        .eq("id", id)
        .single();

      if (original) {
        const { id: _oldId, created_at: _c, updated_at: _u, ...rest } = original;
        const clone = {
          ...rest,
          id: newId,
          name: `${original.name} (Copy)`,
          status: "draft",
          run_count: 0,
          last_run_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: inserted, error } = await (supabase as any)
          .from("workflows")
          .insert(clone)
          .select()
          .single();

        if (!error && inserted) {
          return NextResponse.json({ workflow: inserted });
        }
      }
    }

    return NextResponse.json({
      workflow: {
        id: newId,
        name: "Workflow (Copy)",
        status: "draft",
        nodes: [],
        edges: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
