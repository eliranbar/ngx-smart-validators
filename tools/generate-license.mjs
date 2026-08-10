#!/usr/bin/env node
/**
 * Issue an offline Ed25519 license for ngx-smart-validators.
 *
 * Examples:
 *   node tools/generate-license.mjs --licensee "Acme Inc" --domains "acme.com,*.acme.com"
 *   node tools/generate-license.mjs --keypair
 *
 * Private keys belong only in the gitignored tools/license-private-*.key files
 * or SMART_VALIDATORS_LICENSE_PRIVATE_KEY. Never commit or bundle them.
 */
import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  sign,
} from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function parseArgs(argv) {
  const result = {};
  for (let index = 2; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === '--keypair') {
      result.keypair = true;
    } else if (argument.startsWith('--')) {
      result[argument.slice(2)] = argv[++index];
    }
  }
  return result;
}

function base64(value) {
  return Buffer.from(value).toString('base64');
}

function oneYearFromNow() {
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1);
  return expiry.toISOString().slice(0, 10);
}

const args = parseArgs(process.argv);
if (args.keypair) {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  console.log(
    'PUBLIC_KEY_B64=' +
      base64(publicKey.export({ type: 'spki', format: 'der' })),
  );
  console.log(
    'PRIVATE_KEY_B64=' +
      base64(privateKey.export({ type: 'pkcs8', format: 'der' })),
  );
  process.exit(0);
}

const kid = args.kid ?? 'sv-2026-08';
const product = args.product ?? 'ngx-smart-validators';
const generationKeyPath = resolve(`tools/license-private-${kid}.key`);
const fallbackKeyPath = resolve('tools/license-private.key');
const privateKeyPath = args['private-key']
  ? resolve(args['private-key'])
  : existsSync(generationKeyPath)
    ? generationKeyPath
    : fallbackKeyPath;

let privateKey;
if (existsSync(privateKeyPath)) {
  privateKey = createPrivateKey({
    key: Buffer.from(readFileSync(privateKeyPath, 'utf8').trim(), 'base64'),
    format: 'der',
    type: 'pkcs8',
  });
} else if (process.env.SMART_VALIDATORS_LICENSE_PRIVATE_KEY) {
  privateKey = createPrivateKey({
    key: Buffer.from(
      process.env.SMART_VALIDATORS_LICENSE_PRIVATE_KEY,
      'base64',
    ),
    format: 'der',
    type: 'pkcs8',
  });
} else {
  console.error(
    `Missing private key. Create ${generationKeyPath} or set ` +
      'SMART_VALIDATORS_LICENSE_PRIVATE_KEY.',
  );
  process.exit(1);
}

const features = (
  args.features ?? 'passwordEngine,financial,ageValidation,crossField,phoneAdvanced'
)
  .split(',')
  .map((feature) => feature.trim())
  .filter(Boolean);
const domains = (args.domains ?? '')
  .split(',')
  .map((domain) => domain.trim().toLowerCase())
  .filter(Boolean);

if (domains.length === 0) {
  console.error(
    'Refusing to issue an unbound license. Pass --domains "acme.com,*.acme.com" ' +
      'or explicitly pass --domains "*".',
  );
  process.exit(1);
}

const payloadObject = {
  product,
  kid,
  plan: args.plan ?? 'pro',
  features,
  domains,
  expiry: args.expiry ?? oneYearFromNow(),
  licensee: args.licensee ?? 'unknown',
};
const payload = Buffer.from(JSON.stringify(payloadObject), 'utf8');
const signature = sign(null, payload, privateKey);
const licenseKey = base64(
  Buffer.from(
    JSON.stringify({ p: base64(payload), s: base64(signature) }),
    'utf8',
  ),
);

console.log(
  JSON.stringify({ payload: payloadObject, licenseKey }, null, 2),
);
console.error(`Signed with kid ${kid} using ${privateKeyPath}`);
console.error(
  'PUBLIC_KEY_B64=' +
    base64(
      createPublicKey(privateKey).export({ type: 'spki', format: 'der' }),
    ),
);
