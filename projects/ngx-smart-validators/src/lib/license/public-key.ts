/**
 * License identity for this package: which product keys must be issued for, and
 * which Ed25519 public keys are trusted to sign them.
 */

/**
 * Product this build accepts licenses for. A key carrying a different `product`
 * is rejected even if its signature is valid, so a license for one E.B Dev &
 * Design package can never unlock another.
 *
 * Must be the published npm name, character for character — it is compared
 * verbatim in `validateSmartValidatorsLicenseClaims` and written verbatim by the
 * issuing side (`KeyringService.REGISTRY` in the platform API).
 *
 * Defence in depth only — the real guarantee is that every product has its own
 * keypair, which already-shipped verifiers enforce for free.
 */
export const SMART_VALIDATORS_PRODUCT_ID = '@ebdev/ngx-smart-validators';

export interface SmartValidatorsLicensePublicKey {
  /** Stable signing-generation identifier embedded in each payload. */
  readonly kid: string;
  /** Ed25519 public key encoded as base64 SPKI DER. */
  readonly spkiB64: string;
}

/**
 * Trusted signing keys, newest last. A key is verified against the entry named
 * by its `kid`, or against every entry when it carries no `kid`.
 *
 * **The successor is published roughly a year before it signs anything.** That is
 * what makes rotation survivable: by the time `sv-2027-08` starts issuing keys,
 * the clients that must accept them have shipped. Rotating without a pre-staged
 * successor would require every customer to upgrade the library *before* they
 * could be issued a working key.
 */
export const SMART_VALIDATORS_LICENSE_KEYRING: readonly SmartValidatorsLicensePublicKey[] =
  [
    {
      kid: 'sv-2026-08',
      spkiB64: 'MCowBQYDK2VwAyEAtG3+tUsh/Ox4HkVqU0GngnT4BgXT6+uTBfMIg6Ze+MY=',
    },
    {
      kid: 'sv-2027-08',
      spkiB64: 'MCowBQYDK2VwAyEAN+66eKFrvO/kSrJGJPgVbPI6ze4TYRq97Jda4KRTVO0=',
    },
  ];
