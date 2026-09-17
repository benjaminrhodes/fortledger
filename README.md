# FortLedger

**Verified Fort Worth real-estate records, anchored on-chain.**

> **Hackathon demo — synthetic data — not legal, investment, title, securities, or tax advice.**

FortLedger is a provenance-first deal-room MVP for one fictional Fort Worth industrial property. It turns seven record categories into a versioned asset record: every displayed material fact is tied to a source document, exact location, excerpt, review state, and SHA-256 checksum. A deterministic manifest can be anchored by a transfer-disabled ERC-721-style Asset Record Token.

## Product scope

Demo asset: `FL-TX-FW-0001` — **Fort Worth Rosedale Logistics Center** (fictionalized industrial flex warehouse).

Included categories:

1. Title
2. Survey
3. Zoning
4. Environmental
5. Lease
6. Rent roll
7. Operating costs

The initial demo uses seeded, source-backed extracted values and synthetic, watermarked source records. Live AI extraction, arbitrary-document OCR, multiple properties, maps, graph databases, mainnet deployment, fractional ownership, and production integrations are intentionally deferred.

## Token semantics

The token represents **only the integrity and version of a digital property-record manifest**. It does **not** represent legal title, ownership of land, equity, debt, rental income, securities, or investment rights. Source documents remain off-chain; the chain stores non-sensitive identifiers and cryptographic commitments. Transfers are disabled in the demo contract to reduce misinterpretation.

## Verification semantics

- **Verified** — the anchored hash, current approved manifest, and every referenced source file match.
- **Outdated** — the anchored record is intact, but a newer approved manifest supersedes it.
- **Failed** — a manifest or source-file hash does not match; the affected document is named.
- **Unable to verify** — required chain, manifest, or source-file data is unavailable. Missing data never becomes Verified.

The tamper demonstration changes a copied synthetic source file, runs verification, identifies the affected document, then restores the clean copy. It is reversible and never touches real records.

## Architecture

- Next.js + TypeScript + Tailwind UI (planned/being implemented)
- Local JSON seed data and synthetic off-chain source files
- Node `crypto` SHA-256 hashing and canonical manifest generation
- Solidity + Hardhat + OpenZeppelin transfer-disabled Asset Record contract
- Local chain first; no real funds or credentials required

See `docs/architecture.md`, `docs/data-model.md`, `docs/token-model.md`, and `docs/demo-script.md` as they are completed.

## Setup

The clean setup command sequence will be finalized with the tested MVP. Do not treat this draft checkpoint README as evidence that the full application is complete yet.

```bash
npm install
npm run seed
npm test
npm run build
npm run dev
```

## Competition status

The event identity, closing deadline, and rules governing development before October 1, 2026 are not confirmed. This repository will remain private until Benjamin confirms submission visibility requirements. No eligibility claim is made for work completed before the official build period.

## Current status

See `PROJECT_STATUS.md` for completed milestones, exact commands/results, unresolved questions, and the next concrete action.
