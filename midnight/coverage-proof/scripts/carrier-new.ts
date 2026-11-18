// Creates a carrier's key pair: npm run carrier:new -- <name>
// The secret stays in carriers/<name>.json (gitignored) on the carrier's side.
// Nightlane only ever needs the PUBLIC key, to bind the attestation to it.
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { pureCircuits } from '../contract/index.js';
import { ROOT } from '../src/common.js';

const name = process.argv[2];
if (!name || !/^[a-z0-9-]+$/i.test(name)) {
  console.error('Usage: npm run carrier:new -- <name>   (letters, numbers and dashes)');
  process.exit(1);
}
const file = `${ROOT}carriers/${name}.json`;
if (existsSync(file)) {
  console.error(`carriers/${name}.json already exists. Pick another name, or delete it first.`);
  process.exit(1);
}
const secretKey = new Uint8Array(randomBytes(32));
const publicKey = pureCircuits.deriveCarrierPublicKey(secretKey);
mkdirSync(`${ROOT}carriers`, { recursive: true });
writeFileSync(file, JSON.stringify({ name, secretKey: Buffer.from(secretKey).toString('hex'), publicKey: Buffer.from(publicKey).toString('hex') }, null, 2) + '\n', { mode: 0o600 });
console.log(`Created carrier "${name}".`);
console.log(`Public key (safe to share with Nightlane): ${Buffer.from(publicKey).toString('hex')}`);
console.log(`Secret key saved in carriers/${name}.json. Keep it private.`);
