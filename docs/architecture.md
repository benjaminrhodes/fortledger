# Architecture

FortLedger has three trust boundaries:

1. **Off-chain source layer** — synthetic files remain local/private. Their bytes are the verification authority, not cached UI values.
2. **Application layer** — seeded records attach fields to document IDs, versions, exact source locations, excerpts, review states, and checksums. The UI must fail closed when a source or chain read is unavailable.
3. **Chain anchor** — a local EVM contract records the asset ID, record version, manifest URI, and manifest hash. It does not contain source documents or sensitive data.

Flow: source files → SHA-256 per file → approved/current manifest → manifest hash → mint anchor → read anchor + hash actual files → status.

The first increment is CLI-based; Next.js UI and Solidity integration are the next milestones.
