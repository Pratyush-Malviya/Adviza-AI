import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { MeetingDetailClient } from "@/components/meetings/meeting-detail-client";

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: meeting } = await supabase
    .from("meetings")
    .select("*, clients(*), profiles(full_name)")
    .eq("id", id)
    .single();

  if (!meeting) notFound();

  const { data: actionItems } = await supabase
    .from("action_items")
    .select("*")
    .eq("meeting_id", id)
    .order("priority", { ascending: true });

  return (
    <MeetingDetailClient
      meeting={meeting}
      actionItems={actionItems || []}
    />
  );
}
