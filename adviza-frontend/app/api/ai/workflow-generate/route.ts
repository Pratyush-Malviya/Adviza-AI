import { NextRequest, NextResponse } from "next/server";
import { PREBUILT_WORKFLOW_TEMPLATES } from "@/components/workflows/workflow-templates";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = (body.prompt || "").toLowerCase();

    // Match prompt to best domain template or construct dynamic pipeline
    let selectedTemplate = PREBUILT_WORKFLOW_TEMPLATES[0];

    if (prompt.includes("drift") || prompt.includes("rebalance") || prompt.includes("portfolio")) {
      selectedTemplate =
        PREBUILT_WORKFLOW_TEMPLATES.find((t) => t.id === "tpl-portfolio-drift") ||
        PREBUILT_WORKFLOW_TEMPLATES[0];
    } else if (prompt.includes("compliance") || prompt.includes("finra") || prompt.includes("sec") || prompt.includes("audit")) {
      selectedTemplate =
        PREBUILT_WORKFLOW_TEMPLATES.find((t) => t.id === "tpl-compliance-audit") ||
        PREBUILT_WORKFLOW_TEMPLATES[1] ||
        PREBUILT_WORKFLOW_TEMPLATES[0];
    } else if (prompt.includes("meeting") || prompt.includes("calendar") || prompt.includes("review") || prompt.includes("briefing")) {
      selectedTemplate =
        PREBUILT_WORKFLOW_TEMPLATES.find((t) => t.id === "tpl-meeting-briefing") ||
        PREBUILT_WORKFLOW_TEMPLATES[0];
    } else if (prompt.includes("onboard") || prompt.includes("lead") || prompt.includes("kyc")) {
      selectedTemplate =
        PREBUILT_WORKFLOW_TEMPLATES.find((t) => t.id === "tpl-client-onboarding") ||
        PREBUILT_WORKFLOW_TEMPLATES[0];
    }

    const workflow = {
      name: selectedTemplate.name,
      description: selectedTemplate.description,
      nodes: selectedTemplate.nodes,
      edges: selectedTemplate.edges,
      connected_apps: (selectedTemplate as any).connectedApps || [],
      ai_generated: true,
      ai_prompt: body.prompt,
    };

    return NextResponse.json({ workflow });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
