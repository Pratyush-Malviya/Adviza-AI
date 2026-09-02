import { NextRequest, NextResponse } from "next/server";
import { fetchComposioToolkits } from "@/lib/composio";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "48", 10);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const toolkits = await fetchComposioToolkits({
      page,
      limit,
      search,
      category,
    });

    return NextResponse.json(toolkits);
  } catch (err: any) {
    return NextResponse.json(
      { toolkits: [], totalItems: 0, totalPages: 1, currentPage: 1 },
      { status: 200 }
    );
  }
}
