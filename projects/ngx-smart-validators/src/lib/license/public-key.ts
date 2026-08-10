export const SMART_VALIDATORS_PRODUCT_ID = 'ngx-smart-validators';

export interface SmartValidatorsLicensePublicKey {
  /** Stable signing-generation identifier embedded in each payload. */
  readonly kid: string;
  /** Ed25519 public key encoded as base64 SPKI DER. */
  readonly spkiB64: string;
}

/**
 * Trusted signing keys. Add a successor before issuing licenses with its `kid`
 * so deployed applications can survive signing-key rotation.
 */
export const SMART_VALIDATORS_LICENSE_KEYRING:
readonly SmartValidatorsLicensePublicKey[] = [
  {
    kid: 'sv-2026-08',
    spkiB64: 'MCowBQYDK2VwAyEAVV4OTHfxn10NIN4ljTpSl7zDU5XsS6pluu9XlSBLu7o=',
  },
];
