/**
 * Tamper-evident hash utilities using Web Crypto API (SHA-256)
 */

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export async function computeSha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function computeLogHash(entry: {
  previousHash: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}): Promise<string> {
  const payload = `${entry.previousHash}${entry.actor}${entry.action}${entry.target}${entry.timestamp}`;
  return computeSha256(payload);
}
