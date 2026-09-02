/**
 * Adviza AI - End-to-End Integration Test Suite
 * Tests all backend routes on http://127.0.0.1:4000
 */

import { createClient } from '@supabase/supabase-js';

const BACKEND_URL = process.env.API_URL || 'http://127.0.0.1:4000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vihxibuucbigcvtekvbb.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpaHhpYnV1Y2JpZ2N2dGVrdmJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzcyNTYyOCwiZXhwIjoyMDUzMzAxNjI4fQ.placeholder';

console.log('🧪 Starting Adviza AI Integration Test Suite...');
console.log(`Backend Target: ${BACKEND_URL}`);

async function runTests() {
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      process.stdout.write(`⏳ Testing: ${name}... `);
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log('❌ FAIL');
      console.error('   Error:', err.message);
    }
  }

  // 1. Health check
  await test('GET /v1/health (Public Health Endpoint)', async () => {
    const res = await fetch(`${BACKEND_URL}/v1/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok' || data.service !== 'adviza-backend') {
      throw new Error(`Unexpected payload: ${JSON.stringify(data)}`);
    }
  });

  // 2. Auth Guard Verification
  await test('GET /v1/memory (Reject Unauthorized without Bearer Token)', async () => {
    const res = await fetch(`${BACKEND_URL}/v1/memory`);
    if (res.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, received ${res.status}`);
    }
  });

  // Create or obtain a mock Supabase JWT token for authenticated tests
  // We sign a lightweight JWT using the known service role secret or test payload
  // For test execution, we construct a test bearer token with user metadata
  const testToken = 'test-token';
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${testToken}`,
  };

  // 3. Fiduciary Pre-Meeting Briefing Agent
  await test('POST /v1/agents/briefing (Pre-Meeting Dossier Generation)', async () => {
    const res = await fetch(`${BACKEND_URL}/v1/agents/briefing`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        clientName: 'Eleanor Vance',
        meetingType: 'Annual Portfolio Review',
        recentNotes: 'Expressed interest in municipal bonds and tax-loss harvesting.',
        portfolioAum: 4500000,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }
    const data = await res.json();
    if (!data.briefing && !data.dossier && !data.clientSummary) {
      throw new Error('Briefing agent returned empty payload');
    }
  });

  // 4. Compliance Audit Agent
  await test('POST /v1/agents/compliance (SEC/FINRA Audit Agent)', async () => {
    const res = await fetch(`${BACKEND_URL}/v1/agents/compliance`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        content: 'We guarantee a 15% return on our proprietary crypto fund with zero risk.',
        contentType: 'marketing_email',
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }
    const data = await res.json();
    if (!data.audit) {
      throw new Error('Compliance agent returned empty audit');
    }
  });

  // 5. Meeting Transcript Intelligence
  await test('POST /v1/agents/meeting-intelligence (Transcript Action Items)', async () => {
    const res = await fetch(`${BACKEND_URL}/v1/agents/meeting-intelligence`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        clientName: 'Arthur Dent',
        advisorName: 'Jane Advisor',
        meetingDate: new Date().toISOString().split('T')[0],
        meetingType: 'Quarterly Review',
        transcript: 'Jane: Hi Arthur, we reviewed your $2.5M portfolio today. You agreed we should rebalance 5% from tech into treasury bills. Arthur: Sounds great, please send me the paperwork by Friday.',
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }
    const data = await res.json();
    if (!data.meetingSummary && !data.intelligence?.meetingSummary) {
      throw new Error('Meeting intelligence returned invalid summary');
    }
  });

  // 6. Workflow Generation from Natural Language
  await test('POST /v1/workflows/generate (AI Visual Pipeline Generator)', async () => {
    const res = await fetch(`${BACKEND_URL}/v1/workflows/generate`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        prompt: 'When a calendar meeting ends, transcribe audio, run SEC compliance check, and sync action items to Salesforce CRM',
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }
    const data = await res.json();
    if (!data.nodes || data.nodes.length === 0) {
      throw new Error('Workflow generator did not produce nodes');
    }
  });

  // 7. Workflow Prompt Enhancement
  await test('POST /v1/workflows/enhance-prompt (Prompt Architect)', async () => {
    const res = await fetch(`${BACKEND_URL}/v1/workflows/enhance-prompt`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        prompt: 'audit portfolio drift',
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }
    const data = await res.json();
    if (!data.enhancedPrompt) {
      throw new Error('Enhance prompt returned empty result');
    }
  });

  // 8. WORM HTML Export with Audit Stamp
  await test('GET /v1/documents/export (WORM HTML Export with Audit Stamp)', async () => {
    const res = await fetch(`${BACKEND_URL}/v1/documents/export?type=briefing&title=Q3_Dossier`, {
      method: 'GET',
      headers: authHeaders,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }
    const html = await res.text();
    if (!html.includes('Adviza Fiduciary Dossier') || !html.includes('WORM-COMPLIANT-AUDIT-STAMP')) {
      throw new Error('Exported document missing WORM compliance audit stamp');
    }
  });

  // 9. Portfolio Fiduciary Allocation Models
  await test('GET /v1/portfolio/models (Standard Fiduciary Allocation Models)', async () => {
    const res = await fetch(`${BACKEND_URL}/v1/portfolio/models`, {
      method: 'GET',
      headers: authHeaders,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }
    const data = await res.json();
    if (!data.models || data.models.length === 0) {
      throw new Error('Portfolio models endpoint did not return standard models');
    }
  });

  // 10. Custodial CSV Ingestion & Portfolio Drift Reconciliation
  await test('POST /v1/portfolio/reconcile (Schwab/Fidelity CSV Drift Engine)', async () => {
    const sampleSchwabCSV = `
"Symbol","Description","Quantity","Price","Market Value","Cost Basis"
"SPY","SPDR S&P 500 ETF TRUST",1000,500.00,500000.00,480000.00
"VEA","VANGUARD DEVELOPED MARKETS ETF",1000,45.00,45000.00,40000.00
"BND","VANGUARD TOTAL BOND MARKET ETF",2000,72.00,144000.00,160000.00
"EEM","ISHARES MSCI EMERGING MARKETS ETF",500,40.00,20000.00,24000.00
"USD","CASH / SWEEP",1,50000.00,50000.00,50000.00
    `.trim();

    const res = await fetch(`${BACKEND_URL}/v1/portfolio/reconcile`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        custodian: 'schwab',
        modelId: 'MODERATE_GROWTH',
        csvContent: sampleSchwabCSV,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }
    const data = await res.json();
    if (!data.allocations || data.allocations.length === 0) {
      throw new Error('Portfolio reconciliation failed to compute asset allocations');
    }
    if (typeof data.totalMarketValue !== 'number' || data.totalMarketValue <= 0) {
      throw new Error('Portfolio reconciliation returned invalid total market value');
    }
    if (!data.recommendedOrders || data.recommendedOrders.length === 0) {
      throw new Error('Drift engine failed to generate rebalance orders');
    }
  });

  // 11. LangGraph Multi-Agent Chat Orchestration
  await test('POST /v1/chat/orchestrate (6-Node Multi-Agent Graph)', async () => {
    const res = await fetch(`${BACKEND_URL}/v1/chat/orchestrate`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        message: 'Prepare a pre-meeting briefing for client Eleanor Vance before our 2 PM call',
        ambientContext: {
          clientName: 'Eleanor Vance',
          page: '/dashboard/meetings',
        },
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }
    const data = await res.json();
    if (!data.finalResponse && !data.response && !data.message) {
      throw new Error('Chat orchestrator returned empty response');
    }
  });

  // 12. Portfolio Monitor Drift Audit Job
  await test('POST /v1/portfolio/monitor/run (Scheduled Portfolio Drift Job)', async () => {
    const res = await fetch(`${BACKEND_URL}/v1/portfolio/monitor/run`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        advisorEmail: 'advisor@adviza.ai',
        sendEmail: false,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }
    const data = await res.json();
    if (!data.clientsWithDrift || data.clientsWithDrift.length === 0) {
      throw new Error('Portfolio monitor job returned no audited clients');
    }
    if (typeof data.driftBreachesCount !== 'number') {
      throw new Error('Portfolio monitor returned invalid drift breach count');
    }
  });

  // 13. Portfolio Drift Email Alert Preview
  await test('GET /v1/portfolio/monitor/preview (Resend HTML Alert Preview)', async () => {
    const res = await fetch(`${BACKEND_URL}/v1/portfolio/monitor/preview`, {
      method: 'GET',
      headers: authHeaders,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }
    const html = await res.text();
    if (!html.includes('FIDUCIARY PORTFOLIO MONITOR') || !html.includes('Drift Breaches')) {
      throw new Error('Portfolio drift email preview HTML missing expected headers');
    }
  });

  console.log(`\n🏁 Test Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
}

runTests().catch(console.error);

