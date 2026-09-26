import { Injectable, inject } from '@angular/core';
import { ALL_FEATURES, PRO_FEATURES, SmartValidatorFeatureId } from '../config/features';
import { SMART_VALIDATORS_CONFIG } from '../config/tokens';
import {
  SMART_VALIDATORS_LICENSE_KEYRING,
  SMART_VALIDATORS_PRODUCT_ID,
} from './public-key';

export interface SmartValidatorsLicensePayload {
  readonly product: string;
  readonly kid?: string;
  readonly plan: string;
  readonly features: readonly SmartValidatorFeatureId[];
  readonly expiry: string;
  readonly licensee: string;
  readonly domains?: readonly string[];
}

export type LicenseFailureReason =
  | 'not-verified'
  | 'missing-key'
  | 'parse-error'
  | 'no-crypto'
  | 'invalid-signature'
  | 'product-mismatch'
  | 'expired'
  | 'domain-mismatch';

export interface LicenseState {
  readonly valid: boolean;
  readonly payload: SmartValidatorsLicensePayload | null;
  readonly reason?: LicenseFailureReason;
}

const DEVELOPMENT_HOSTS = new Set([
  '',
  'localhost',
  '127.0.0.1',
  '::1',
  '0.0.0.0',
]);
const EXPIRY_GRACE_MS = 24 * 60 * 60 * 1000;
const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64ToBytes(value: string): Uint8Array {
  const normalized = value.replace(/\s/g, '');
  if (
    normalized.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)
  ) {
    throw new Error('Invalid base64');
  }

  const outputLength =
    (normalized.length / 4) * 3 -
    (normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0);
  const output = new Uint8Array(outputLength);
  let outputIndex = 0;

  for (let index = 0; index < normalized.length; index += 4) {
    const chunk = normalized.slice(index, index + 4);
    const bits =
      (BASE64_ALPHABET.indexOf(chunk[0]) << 18) |
      (BASE64_ALPHABET.indexOf(chunk[1]) << 12) |
      ((chunk[2] === '=' ? 0 : BASE64_ALPHABET.indexOf(chunk[2])) << 6) |
      (chunk[3] === '=' ? 0 : BASE64_ALPHABET.indexOf(chunk[3]));
    if (outputIndex < outputLength) output[outputIndex++] = bits >> 16;
    if (outputIndex < outputLength) output[outputIndex++] = (bits >> 8) & 0xff;
    if (outputIndex < outputLength) output[outputIndex++] = bits & 0xff;
  }
  return output;
}

function isDevelopmentHost(hostname: string): boolean {
  return DEVELOPMENT_HOSTS.has(hostname) || hostname.endsWith('.localhost');
}

function matchesDomain(
  domains: readonly string[] | undefined,
  hostname: string,
): boolean {
  if (!domains?.length) return true;
  return domains.some((raw) => {
    const pattern = raw.trim().toLowerCase();
    if (pattern === '*') return true;
    if (pattern.startsWith('*.')) {
      const apex = pattern.slice(2);
      return hostname === apex || hostname.endsWith(`.${apex}`);
    }
    return pattern !== '' && hostname === pattern;
  });
}

/** Pure claim validation seam; signature verification always runs before this. */
export function validateSmartValidatorsLicenseClaims(
  payload: SmartValidatorsLicensePayload,
  hostname: string,
  now = Date.now(),
): LicenseFailureReason | null {
  if (payload.product !== SMART_VALIDATORS_PRODUCT_ID) {
    return 'product-mismatch';
  }
  const expiresAt = Date.parse(payload.expiry);
  if (Number.isFinite(expiresAt) && expiresAt + EXPIRY_GRACE_MS < now) {
    return 'expired';
  }
  const normalizedHost = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    !isDevelopmentHost(normalizedHost) &&
    !matchesDomain(payload.domains, normalizedHost)
  ) {
    return 'domain-mismatch';
  }
  return null;
}

type SignatureVerifier = (
  payload: Uint8Array,
  signature: Uint8Array,
  spki: Uint8Array,
) => Promise<boolean>;

async function webCryptoVerifier(): Promise<SignatureVerifier | null> {
  const subtle = globalThis.crypto?.subtle;
  const probe = SMART_VALIDATORS_LICENSE_KEYRING[0];
  if (!subtle || !probe) return null;
  try {
    await subtle.importKey(
      'spki',
      base64ToBytes(probe.spkiB64) as BufferSource,
      { name: 'Ed25519' },
      false,
      ['verify'],
    );
  } catch {
    return null;
  }
  return async (payload, signature, spki) => {
    const key = await subtle.importKey(
      'spki',
      spki as BufferSource,
      { name: 'Ed25519' },
      false,
      ['verify'],
    );
    return subtle.verify(
      'Ed25519',
      key,
      signature as BufferSource,
      payload as BufferSource,
    );
  };
}

async function nobleVerifier(): Promise<SignatureVerifier> {
  const [ed, sha2] = await Promise.all([
    import('@noble/ed25519'),
    import('@noble/hashes/sha2.js'),
  ]);
  ed.hashes.sha512 = sha2.sha512;
  ed.hashes.sha512Async = async (message) => sha2.sha512(message);
  return async (payload, signature, spki) => {
    try {
      return await ed.verifyAsync(
        signature,
        payload,
        spki.subarray(spki.length - 32),
      );
    } catch {
      return false;
    }
  };
}

let verifierPromise: Promise<SignatureVerifier> | null = null;

function resolveVerifier(): Promise<SignatureVerifier> {
  verifierPromise ??= webCryptoVerifier().then(
    (nativeVerifier) => nativeVerifier ?? nobleVerifier(),
  );
  return verifierPromise;
}

export function resetLicenseVerifierForTesting(): void {
  verifierPromise = null;
}

@Injectable()
export class LicenseService {
  private readonly config = inject(SMART_VALIDATORS_CONFIG);
  private state: LicenseState = {
    valid: false,
    payload: null,
    reason: 'not-verified',
  };
  private pending: Promise<LicenseState> | null = null;

  verify(): Promise<LicenseState> {
    this.pending ??= this.runVerify();
    return this.pending;
  }

  getState(): LicenseState {
    return this.state;
  }

  getLicensedFeatures(): readonly SmartValidatorFeatureId[] {
    if (!this.state.valid || !this.state.payload) return [];
    const listed = (this.state.payload.features ?? []).filter((feature) =>
      ALL_FEATURES.includes(feature),
    );
    return listed.length === 0 && this.state.payload.plan === 'pro'
      ? PRO_FEATURES
      : listed;
  }

  private async runVerify(): Promise<LicenseState> {
    const licenseKey = this.config.licenseKey?.trim();
    if (!licenseKey) return this.settle(false, null, 'missing-key');

    let payloadBytes: Uint8Array;
    let signatureBytes: Uint8Array;
    let payload: SmartValidatorsLicensePayload;
    try {
      const envelopeJson = new TextDecoder().decode(
        base64ToBytes(licenseKey),
      );
      const envelope = JSON.parse(envelopeJson) as { p?: unknown; s?: unknown };
      if (typeof envelope.p !== 'string' || typeof envelope.s !== 'string') {
        throw new Error('License envelope must contain base64 p and s fields');
      }
      payloadBytes = base64ToBytes(envelope.p);
      signatureBytes = base64ToBytes(envelope.s);
      payload = JSON.parse(
        new TextDecoder().decode(payloadBytes),
      ) as SmartValidatorsLicensePayload;
    } catch (error) {
      this.warn('Could not read license key', error);
      return this.settle(false, null, 'parse-error');
    }

    let verify: SignatureVerifier;
    try {
      verify = await resolveVerifier();
    } catch (error) {
      this.warn('No Ed25519 implementation is available', error);
      return this.settle(false, payload, 'no-crypto');
    }

    const candidates = payload.kid
      ? SMART_VALIDATORS_LICENSE_KEYRING.filter(
          (candidate) => candidate.kid === payload.kid,
        )
      : SMART_VALIDATORS_LICENSE_KEYRING;
    let signatureValid = false;
    for (const candidate of candidates) {
      if (
        await verify(
          payloadBytes,
          signatureBytes,
          base64ToBytes(candidate.spkiB64),
        )
      ) {
        signatureValid = true;
        break;
      }
    }
    if (!signatureValid) {
      this.warn('Invalid license signature or signing key id');
      return this.settle(false, null, 'invalid-signature');
    }

    const failure = validateSmartValidatorsLicenseClaims(
      payload,
      this.currentHostname(),
    );
    if (failure) {
      this.warn(`License rejected: ${failure}`);
      return this.settle(false, payload, failure);
    }
    return this.settle(true, payload);
  }

  private currentHostname(): string {
    return globalThis.location?.hostname ?? '';
  }

  private warn(message: string, error?: unknown): void {
    console.warn(
      `[ngx-smart-validators] ${message} — running with free features.`,
      ...(error === undefined ? [] : [error]),
    );
  }

  private settle(
    valid: boolean,
    payload: SmartValidatorsLicensePayload | null,
    reason?: LicenseFailureReason,
  ): LicenseState {
    this.state = reason ? { valid, payload, reason } : { valid, payload };
    return this.state;
  }
}
