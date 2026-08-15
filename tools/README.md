# License tooling

Generate Ed25519 key pairs and signed license keys for `@ebdev/ngx-smart-validators`
Pro features.

```bash
# Create a new key pair (store the private key securely; never commit it)
node tools/generate-license.mjs --keypair

# Issue a license (reads tools/license-private-<kid>.key, or $SMART_VALIDATORS_LICENSE_PRIVATE_KEY)
node tools/generate-license.mjs --licensee "Acme Inc" --domains "acme.com,*.acme.com"

# Custom term and feature list
node tools/generate-license.mjs --licensee "Acme Inc" --domains "*.acme.com" \
  --expiry 2028-06-30 --features "passwordEngine,financial"
```

| Flag | Default | Notes |
| --- | --- | --- |
| `--domains` | **required** | Comma-separated hostnames. `*.acme.com` covers the apex and all subdomains. `*` deliberately allows any host — avoid. |
| `--expiry` | one year from today | `YYYY-MM-DD`. Honoured with a 24h grace, so it holds through the whole of that day in every timezone. |
| `--features` | all Pro features | Ids from `PRO_FEATURES` in `src/lib/config/features.ts`. |
| `--licensee` | `unknown` | Recorded in the payload; shows up in support requests. |
| `--plan` | `pro` | A `pro` plan with an empty `--features` list grants all of `PRO_FEATURES`. |
| `--product` | `@ebdev/ngx-smart-validators` | Rejected by any other package, even with a valid signature. |
| `--kid` | `sv-2026-08` | Signing generation. **Must exist in the client keyring** or the key verifies nowhere. |
| `--private-key` | `tools/license-private-<kid>.key`, else `tools/license-private.key` | Falls back to `$SMART_VALIDATORS_LICENSE_PRIVATE_KEY`. |

Local development hosts (`localhost`, `127.0.0.1`, `0.0.0.0`, `::1`, `*.localhost`)
bypass domain binding, so customers do not need a key for `ng serve` or CI.

Embed only **public** keys, in
`projects/ngx-smart-validators/src/lib/license/public-key.ts`.

## Two rules that keep this system recoverable

**1. One keypair per product, forever.** Never sign a license for another package
with this key. The `product` field is a convenience for support and for newer
clients; the real guarantee is that a key for `@ebdev/ngx-richtext` is
mathematically unable to verify against this package's public key — and that
holds even in versions shipped before `product` existed.

**2. Publish the successor key about a year before it signs anything.** The client
trusts every key in `SMART_VALIDATORS_LICENSE_KEYRING`, so rotation only works if
the *next* key is already in customers' hands. `sv-2027-08` ships in the first
published release and signs nothing yet. Skip this and a rotation becomes:
publish a release, wait for every customer to upgrade, and only then issue a
working key.

## Planned rotation

Because the successor is pre-staged, this is routine and customer-invisible.

1. Start issuing with `--kid sv-2027-08` (its private key is already in your
   secret store from when it was generated).
2. Generate the *next* successor, add its public key to the keyring, and publish a
   release. You are now a year ahead again.
3. Existing keys signed by `sv-2026-08` keep verifying until they expire. Nothing
   needs reissuing.

## Emergency rotation (private key compromised)

Keys signed by the compromised generation cannot be un-issued — offline
verification has no revocation. Damage is bounded by their remaining term.

1. Stop issuing with the compromised `kid` immediately.
2. Switch issuance to the pre-staged successor.
3. **Remove the compromised entry from `SMART_VALIDATORS_LICENSE_KEYRING`** and
   publish. This invalidates every key that generation signed, so reissue all
   affected customers from the successor *before* the release goes out.
4. Generate and pre-stage a fresh successor.

## Key files

`tools/license-private*.key` is gitignored. Each holds a base64 PKCS#8 DER
private key, mode `0600`.

| File | Generation | Status |
| --- | --- | --- |
| `tools/license-private.key` | `sv-2026-08` | **Active** — signs today's licenses |
| `tools/license-private-sv-2027-08.key` | `sv-2027-08` | Pre-staged successor — trusted by clients, signs nothing yet |

Back both up outside this machine. Losing the active key means no new licenses;
losing the successor means an emergency rotation has no landing ground.

> **The pair generated on 2026-08-14 replaced an earlier `sv-2026-08` whose
> private half was never findable.** Nothing had been published to npm and no
> license had been issued against it, so replacing the keyring entry outright was
> free. That is only true once: from the first published release onward, an entry
> can be added to but never replaced, because replacing it invalidates every key
> that generation ever signed.

The platform API signs customer licenses with its own copy of the active private
key, stored as the `sv_signing_key` secret and registered in
`apps/api/src/licenses/keyring.service.ts`. The public half there must match the
`sv-2026-08` entry above character for character.
