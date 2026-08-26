import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { executeComposioAction } from "@/lib/composio";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { meetingId, recipientEmail, subject, body } = await req.json();

    if (!recipientEmail || !body) {
      return NextResponse.json(
        { error: "Recipient email and body are required" },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*, firms(*)")
      .eq("id", user.id)
      .single();

    // Execute Gmail send via Composio
    const result = await executeComposioAction(user.id, "GMAIL_SEND_MESSAGE", {
      recipientEmail,
      subject: subject || "Follow-up: Wealth Management Strategy Review",
      body,
    });

    if (meetingId) {
      await supabase
        .from("meetings")
        .update({ follow_up_sent: true })
        .eq("id", meetingId);

      if (profile?.firm_id) {
        await supabase.from("audit_logs").insert({
          firm_id: profile.firm_id,
          user_id: user.id,
          action: "integration.gmail_sent",
          entity_type: "meeting",
          entity_id: meetingId,
          metadata: {
            recipient: recipientEmail,
            subject,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      messageId: result?.messageId || "mock_msg_id",
      mock: Boolean(result?.mock),
    });
  } catch (error: any) {
    console.error("Gmail send error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email via Gmail" },
      { status: 500 }
    );
  }
}
