import { AdvizaAgentStateType, MissingConnector } from "../state";
import { findCapability } from "@/lib/capabilities/registry";
import { getComposioConnections, initiateComposioConnection, SUPPORTED_COMPOSIO_APPS } from "@/lib/composio";

export async function connectorValidatorNode(
  state: AdvizaAgentStateType
): Promise<Partial<AdvizaAgentStateType>> {
  const { capabilityCalls, userId } = state;
  const missingConnectors: MissingConnector[] = [];

  if (!capabilityCalls || capabilityCalls.length === 0) {
    return { missingConnectors: [] };
  }

  let activeConnections: any[] = [];
  try {
    activeConnections = await getComposioConnections(userId);
  } catch (err) {
    console.warn("[langgraph-connector-validator] Failed to fetch active connections:", err);
  }

  const updatedCalls = [...capabilityCalls];

  for (let i = 0; i < updatedCalls.length; i++) {
    const call = updatedCalls[i];
    const cap = findCapability(call.capability_id);
    if (!cap || cap.source !== "composio_connector" || !cap.requiredConnector) {
      continue;
    }

    const category = cap.category || "email";
    const requiredSlug = cap.requiredConnector.toLowerCase();

    // 1. Check if the exact app or ANY app in the category is connected
    const exactConnection = activeConnections.find(
      (c) =>
        c.status === "CONNECTED" &&
        (c.appName.toLowerCase().includes(requiredSlug) || requiredSlug.includes(c.appName.toLowerCase()))
    );

    // Alternative connected app in the same category (e.g. user has Outlook instead of Gmail)
    const categoryConnection =
      exactConnection ||
      activeConnections.find((c) => {
        if (c.status !== "CONNECTED") return false;
        const appMeta = SUPPORTED_COMPOSIO_APPS.find(
          (a) => a.id.toLowerCase() === c.appName.toLowerCase()
        );
        return appMeta?.category === category;
      });

    if (categoryConnection) {
      // An app in this category is connected! Update the call if needed
      continue;
    }

    // 2. No connected app in this category! Discover ALL available connectors for this category
    const categoryApps = SUPPORTED_COMPOSIO_APPS.filter((a) => a.category === category);
    const candidateApps = categoryApps.length > 0 ? categoryApps : SUPPORTED_COMPOSIO_APPS.filter((a) => a.id === requiredSlug);

    for (const app of candidateApps) {
      if (missingConnectors.some((m) => m.appSlug === app.id)) continue;

      let authUrl: string | undefined = undefined;
      try {
        const callbackUrl = process.env.NEXTAUTH_URL
          ? `${process.env.NEXTAUTH_URL}/dashboard/chat?connected=${app.id}`
          : "https://adviza-ai.vercel.app/dashboard/chat";
        const authData = await initiateComposioConnection(userId, app.id, callbackUrl);
        authUrl = authData.redirectUrl;
      } catch (authErr) {
        console.warn(`[langgraph-connector-validator] Failed to generate auth URL for ${app.id}:`, authErr);
      }

      missingConnectors.push({
        appSlug: app.id,
        appName: app.name,
        category: app.category,
        description: app.description,
        authUrl,
        pendingAction: {
          capabilityId: call.capability_id,
          parameters: call.parameters,
          preview: {
            title: cap.name,
            recipient: call.parameters.recipient_email || call.parameters.recipientEmail,
            subject: call.parameters.subject,
            body: call.parameters.body,
            details: call.parameters,
          },
        },
      });
    }
  }

  return {
    missingConnectors,
    capabilityCalls: updatedCalls,
  };
}
