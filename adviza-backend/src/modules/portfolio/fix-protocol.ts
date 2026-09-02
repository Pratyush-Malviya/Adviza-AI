/**
 * Adviza AI - FIX Protocol 4.4 / 5.0 Engine
 * Financial Information eXchange Message Generator & Execution Report Simulator
 * Supports Charles Schwab, Fidelity Institutional, and BNY Mellon Pershing.
 */

import { CustodianType, RebalanceOrder } from '../../types/portfolio.js';

export interface FixTagValue {
  tag: number;
  name: string;
  value: string | number;
  description?: string;
}

export interface FixMessage {
  raw: string;
  formatted: string;
  msgType: string;
  clOrdId: string;
  account: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  orderQty: number;
  ordType: 'MARKET' | 'LIMIT';
  price?: number;
  custodian: CustodianType;
  tags: FixTagValue[];
  checksum: string;
  timestamp: string;
}

export interface FixExecutionReport {
  execId: string;
  clOrdId: string;
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  orderQty: number;
  cumQty: number;
  leavesQty: number;
  avgPx: number;
  lastPx: number;
  lastQty: number;
  ordStatus: 'FILLED' | 'PARTIALLY_FILLED' | 'REJECTED';
  execType: '2' | '1' | '8'; // 2=Filled, 1=Partial, 8=Rejected
  text: string;
  rawFixReport: string;
  custodian: CustodianType;
  transactedAt: string;
}

const CUSTODIAN_TARGET_COMPS: Record<CustodianType, { targetCompId: string; senderCompId: string; name: string }> = {
  schwab: { targetCompId: 'SCHW_FIX_GW', senderCompId: 'ADVIZA_RIA_SCHW', name: 'Charles Schwab Institutional' },
  fidelity: { targetCompId: 'FID_FIMS_GW', senderCompId: 'ADVIZA_RIA_FID', name: 'Fidelity Institutional Wealth' },
  pershing: { targetCompId: 'PERSHING_NETX_GW', senderCompId: 'ADVIZA_RIA_PERSH', name: 'BNY Mellon Pershing' },
  generic: { targetCompId: 'CUSTODIAN_FIX_GW', senderCompId: 'ADVIZA_RIA_PROD', name: 'Standard Fiduciary Custodian' },
};

/**
 * Calculates standard FIX 3-digit modulo 256 checksum (Tag 10).
 */
export function calculateFixChecksum(messageWithoutChecksum: string): string {
  let sum = 0;
  for (let i = 0; i < messageWithoutChecksum.length; i++) {
    sum += messageWithoutChecksum.charCodeAt(i);
  }
  const checksum = (sum % 256).toString().padStart(3, '0');
  return checksum;
}

/**
 * Format UTC timestamp in FIX standard YYYYMMDD-HH:MM:SS.sss format (Tag 52).
 */
export function getFixTimestamp(date = new Date()): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  const ms = String(date.getUTCMilliseconds()).padStart(3, '0');
  return `${yyyy}${mm}${dd}-${hh}:${min}:${ss}.${ms}`;
}

/**
 * Generates a FIX 4.4 New Order Single (Tag 35=D) message from a rebalance order.
 */
export function generateFixOrder(
  order: RebalanceOrder,
  accountNumber: string = 'ACC-882190',
  custodian: CustodianType = 'schwab',
  seqNumber: number = 1
): FixMessage {
  const config = CUSTODIAN_TARGET_COMPS[custodian] || CUSTODIAN_TARGET_COMPS.generic;
  const timestamp = getFixTimestamp();
  const clOrdId = `ORD-${custodian.toUpperCase().slice(0, 3)}-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const side: 'BUY' | 'SELL' = order.action === 'SELL' ? 'SELL' : 'BUY';
  const sideCode = side === 'BUY' ? '1' : '2';
  const qty = Math.max(1, Math.round(order.estimatedShares || order.estimatedAmount / 150));

  // Build Body Tags
  const bodyTags: Array<{ tag: number; name: string; value: string | number; desc?: string }> = [
    { tag: 35, name: 'MsgType', value: 'D', desc: 'New Order Single' },
    { tag: 49, name: 'SenderCompID', value: config.senderCompId },
    { tag: 56, name: 'TargetCompID', value: config.targetCompId },
    { tag: 34, name: 'MsgSeqNum', value: seqNumber },
    { tag: 52, name: 'SendingTime', value: timestamp },
    { tag: 11, name: 'ClOrdID', value: clOrdId },
    { tag: 1, name: 'Account', value: accountNumber },
    { tag: 55, name: 'Symbol', value: order.ticker.toUpperCase() },
    { tag: 54, name: 'Side', value: sideCode, desc: side === 'BUY' ? '1 (Buy)' : '2 (Sell)' },
    { tag: 60, name: 'TransactTime', value: timestamp },
    { tag: 38, name: 'OrderQty', value: qty },
    { tag: 40, name: 'OrdType', value: '1', desc: '1 (Market)' },
    { tag: 59, name: 'TimeInForce', value: '0', desc: '0 (Day)' },
    { tag: 21, name: 'HandlInst', value: '1', desc: '1 (Automated Execution Private)' },
    { tag: 100, name: 'ExDestination', value: custodian.toUpperCase() },
  ];

  // Construct message body without header 8/9 and trailer 10
  const bodyString = bodyTags.map((t) => `${t.tag}=${t.value}\x01`).join('');
  const bodyLength = bodyString.length;

  const header = `8=FIX.4.4\x019=${bodyLength}\x01`;
  const messageForChecksum = `${header}${bodyString}`;
  const checksum = calculateFixChecksum(messageForChecksum);
  const rawFix = `${messageForChecksum}10=${checksum}\x01`;
  const formattedFix = rawFix.replace(/\x01/g, ' | ');

  const allTags: FixTagValue[] = [
    { tag: 8, name: 'BeginString', value: 'FIX.4.4' },
    { tag: 9, name: 'BodyLength', value: bodyLength },
    ...bodyTags.map((t) => ({ tag: t.tag, name: t.name, value: t.value, description: t.desc })),
    { tag: 10, name: 'CheckSum', value: checksum },
  ];

  return {
    raw: rawFix,
    formatted: formattedFix,
    msgType: 'D',
    clOrdId,
    account: accountNumber,
    symbol: order.ticker.toUpperCase(),
    side,
    orderQty: qty,
    ordType: 'MARKET',
    custodian,
    tags: allTags,
    checksum,
    timestamp,
  };
}

/**
 * Generates a batch of FIX 4.4 messages for all active rebalance orders (filtering out HOLD).
 */
export function generateFixOrderBatch(
  orders: RebalanceOrder[],
  accountNumber: string = 'ACC-882190',
  custodian: CustodianType = 'schwab'
): FixMessage[] {
  const actionableOrders = orders.filter((o) => o.action === 'BUY' || o.action === 'SELL');
  return actionableOrders.map((order, idx) => generateFixOrder(order, accountNumber, custodian, idx + 1));
}

/**
 * Simulates Execution Report (Tag 35=8) confirmations from the custodian FIX gateway.
 */
export function simulateFixExecution(fixMessage: FixMessage, marketPrice: number = 185.50): FixExecutionReport {
  const config = CUSTODIAN_TARGET_COMPS[fixMessage.custodian] || CUSTODIAN_TARGET_COMPS.generic;
  const execId = `EXEC-${fixMessage.custodian.toUpperCase().slice(0, 3)}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderId = `CUST-ORD-${Date.now()}`;
  const timestamp = getFixTimestamp();

  const execReportTags = [
    `8=FIX.4.4`,
    `35=8`, // Execution Report
    `49=${config.targetCompId}`,
    `56=${config.senderCompId}`,
    `52=${timestamp}`,
    `11=${fixMessage.clOrdId}`,
    `37=${orderId}`,
    `17=${execId}`,
    `150=2`, // ExecType=Filled
    `39=2`,  // OrdStatus=Filled
    `55=${fixMessage.symbol}`,
    `54=${fixMessage.side === 'BUY' ? '1' : '2'}`,
    `38=${fixMessage.orderQty}`,
    `32=${fixMessage.orderQty}`,
    `31=${marketPrice.toFixed(2)}`,
    `151=0`, // LeavesQty
    `14=${fixMessage.orderQty}`, // CumQty
    `6=${marketPrice.toFixed(2)}`, // AvgPx
    `60=${timestamp}`,
  ];

  const bodyStr = execReportTags.slice(1).join('\x01') + '\x01';
  const headerStr = `8=FIX.4.4\x019=${bodyStr.length}\x01`;
  const checksum = calculateFixChecksum(`${headerStr}${bodyStr}`);
  const rawReport = `${headerStr}${bodyStr}10=${checksum}\x01`;

  return {
    execId,
    clOrdId: fixMessage.clOrdId,
    orderId,
    symbol: fixMessage.symbol,
    side: fixMessage.side,
    orderQty: fixMessage.orderQty,
    cumQty: fixMessage.orderQty,
    leavesQty: 0,
    avgPx: marketPrice,
    lastPx: marketPrice,
    lastQty: fixMessage.orderQty,
    ordStatus: 'FILLED',
    execType: '2',
    text: `Order ${fixMessage.clOrdId} executed in full at $${marketPrice.toFixed(2)} via ${config.name} FIX Gateway`,
    rawFixReport: rawReport.replace(/\x01/g, ' | '),
    custodian: fixMessage.custodian,
    transactedAt: new Date().toISOString(),
  };
}
