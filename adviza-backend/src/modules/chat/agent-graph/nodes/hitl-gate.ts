import { AdvizaAgentStateType, HITLPrompt } from '../state.js';
import { findCapability } from '../../capabilities/registry.js';

export async function hitlGateNode(
  state: AdvizaAgentStateType
): Promise<Partial<AdvizaAgentStateType>> {
  const { capabilityCalls } = state;
  const hitlPrompts: HITLPrompt[] = [];

  for (const call of capabilityCalls || []) {
    const cap = findCapability(call.capability_id);
    if (call.requiresHITL || cap?.requiresHITL) {
      hitlPrompts.push({
        actionId: `hitl_${call.capability_id}_${Date.now()}`,
        title: `Advisor Sign-Off Required: ${cap?.name || call.capability_id}`,
        description: `This action interacts directly with external systems or client records. Please review and approve before execution.`,
        payload: {
          capabilityId: call.capability_id,
          parameters: call.parameters,
          reason: call.reason,
        },
      });
    }
  }

  return { hitlPrompts };
}
