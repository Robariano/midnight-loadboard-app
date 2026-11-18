// Shared helpers for the Nightlane coverage-proof scripts.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import pino from 'pino';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const NETWORK = process.env['MIDNIGHT_NETWORK'] ?? 'preview';

export const logger = pino({ level: process.env['LOG_LEVEL'] ?? 'info', transport: { target: 'pino-pretty' } });

/** Loads .env.<network> (created by the deploy script). */
export function loadSecrets(): void {
  const file = `${ROOT}.env.${NETWORK}`;
  if (!existsSync(file)) throw new Error(`.env.${NETWORK} not found. Run the deploy script first (npm run deploy:${NETWORK}).`);
  process.loadEnvFile(file);
}

export type DeploymentRecord = {
  network: string;
  contractAddress: string;
  attestor: { id: number; publicKey: { x: string; y: string } };
};

export function readDeployment(): DeploymentRecord {
  const file = `${ROOT}deployments/${NETWORK}.json`;
  if (!existsSync(file)) throw new Error(`deployments/${NETWORK}.json not found. Deploy first.`);
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** A broker's request id: SHA-256 of the request text, e.g. "MC 123456 load 4471". */
export const requestIdOf = (text: string): Uint8Array =>
  new Uint8Array(createHash('sha256').update(text.trim().replace(/\s+/g, ' ').toLowerCase()).digest());

/** "2026-12-31" -> Unix seconds at the end of that day (UTC). */
export function endOfDay(date: string): bigint {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`Use YYYY-MM-DD dates (got "${date}").`);
  const ms = Date.parse(`${date}T23:59:59Z`);
  if (Number.isNaN(ms)) throw new Error(`Not a real date: ${date}`);
  return BigInt(Math.floor(ms / 1000));
}

export const fromUnix = (s: bigint) => new Date(Number(s) * 1000).toISOString().slice(0, 10);

export const dollars = (v: string | bigint) => {
  const n = BigInt(String(v).replace(/[$,]/g, ''));
  if (n < 0n || n >= 2n ** 32n) throw new Error(`Dollar amount out of range: ${v}`);
  return n;
};

export const usd = (n: bigint) => `$${Number(n).toLocaleString('en-US')}`;

// JSON with bigints and byte arrays, for the carrier's private files.
export const toJson = (v: unknown) =>
  JSON.stringify(v, (_k, x) => (typeof x === 'bigint' ? `${x}n` : x instanceof Uint8Array ? Buffer.from(x).toString('hex') : x), 2);
export const reviveBigints = (v: any): any =>
  typeof v === 'string' && /^\d+n$/.test(v) ? BigInt(v.slice(0, -1))
  : Array.isArray(v) ? v.map(reviveBigints)
  : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, reviveBigints(x)]))
  : v;
