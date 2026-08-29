import { AdvizaAgentStateType, MissingConnector } from "../state";
import { findCapability, getAppForConnector } from "@/lib/capabilities/registry";
import { getComposioConnections, initiateComposioConnection } from "@/lib/composio";

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

  for (const call of capabilityCalls) {
    const cap = findCapability(call.capability_id);
    if (!cap || cap.source !== "composio_connector" || !cap.requiredConnector) {
      continue;
    }

    const requiredSlug = cap.requiredConnector.toLowerCase();
    const isConnected = activeConnections.some(
      (c) =>
        c.status === "CONNECTED" &&
        (c.appName.toLowerCase().includes(requiredSlug) || requiredSlug.includes(c.appName.toLowerCase()))
    );

    if (!isConnected) {
      const appMeta = getAppForConnector(cap.requiredConnector);
      const appName = appMeta?.name || cap.requiredConnector.toUpperCase();
      const appSlug = appMeta?.id || cap.requiredConnector;

      let authUrl: string | undefined = undefined;
      try {
        const callbackUrl = process.env.NEXTAUTH_URL
          ? `${process.env.NEXTAUTH_URL}/dashboard/integrations?connected=${appSlug}`
          : "https://adviza-ai.vercel.app/dashboard/integrations";
        const authData = await initiateComposioConnection(userId, appSlug, callbackUrl);
        authUrl = authData.redirectUrl;
      } catch (authErr) {
        console.warn(`[langgraph-connector-validator] Failed to generate auth URL for ${appSlug}:`, authErr);
      }

      if (!missingConnectors.some((m) => m.appSlug === appSlug)) {
        missingConnectors.push({
          appSlug,
          appName,
          authUrl,
        });
      }
    }
  }

  return { missingConnectors };
}
