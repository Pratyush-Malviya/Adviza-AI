import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processMeetingEvent, generateBriefingEvent, executeWorkflowPipeline } from "@/lib/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processMeetingEvent, generateBriefingEvent, executeWorkflowPipeline],
});
