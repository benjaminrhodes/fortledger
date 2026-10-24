# FortLedger

**Verified Fort Worth industrial records, anchored on a local chain.**

> Synthetic hackathon demonstration. Not legal, title, survey, environmental, investment, securities, or tax advice.

FortLedger is a provenance demo for one fictional Fort Worth industrial property. Seven record categories become a versioned asset record. Each displayed fact cites a source document, a location, and an excerpt, or it is marked `not_found`. A transfer-disabled asset-record token on a local Hardhat chain stores the asset id, record version, and manifest hash. Verification reads that hash from the chain and hashes the files on disk.

**HackFW MADE Challenge — Track 04, Tokenized Industrial Real Estate.** Devpost deadline: Friday, October 30, 2026, 11:00 AM CDT.

## Setup

Node.js 20 or newer. No API keys. The first `npm test` downloads the Solidity 0.8.24 compiler.

```bash
npm install
npm test
npm run dev
```

Open http://127.0.0.1:4173

`npm run dev` compiles the contract, starts a local Hardhat node, anchors the current manifest, and serves the operator page. The page checks the record on load. Use **Verify**, **Tamper ESA v2**, and **Restore ESA v2** to show a clean record, a failed record that names `DOC-ENV-001-V2`, and recovery. Source bytes stay on this machine. The chain stores the commitment only.

Other commands, from the repository root:

```bash
npm run tamper-demo   # verified → failed → verified, against the chain, then deletes its backup
npm run bench         # writes results/bench.json
npm run seed          # rehash sample-data/documents.json from sample-data/catalog.json
npm run manifest      # rewrite sample-data/manifest-v1.json
npm run verify        # one chain-backed check; exit 2 when the chain cannot be read
```

`npm run chain` and `npm run anchor` are the same steps `npm run dev` runs for you. Hardhat's local accounts are public demo keys created by the tool. Do not send real funds to them.

## Demo asset

`FL-TX-FW-0001` — **Fort Worth Rosedale Logistics Center** (fictional industrial flex warehouse).

1. Title
2. Survey
3. Zoning
4. Environmental (Phase I v1 superseded by v2; v1’s report date is outside the 180-day viability window, v2’s is inside it)
5. Lease
6. Rent roll
7. Operating costs

Industrial fit fields are power, clear height, dock doors, floor load, and transport access. Floor load is `not_found` because the synthetic survey does not state it. Review status is an input in `sample-data/catalog.json`. Only rows with `current: true` and `reviewStatus: "human_verified"` enter the approved manifest. Change a status to `pending_review`, run `npm run seed`, and that document drops out.

## What the token is

`contracts/AssetRecordToken.sol` is a minimal ERC-721-style record token. The authorized issuer can mint. Any other mint reverts. Transfers and approvals revert. `legal_title` and `investment_rights` are false. The token does not represent land, equity, debt, rent, or an investment. It records the integrity and version of a digital manifest.

## Verification

- **Verified** — the chain hash, the current approved manifest, and every approved source file match.
- **Outdated** — a newer approved manifest supersedes the chain, and the anchored manifest's files still match the hashes that were committed.
- **Failed** — a manifest or source-file hash does not match. The result names the document.
- **Unable to verify** — the chain, the anchored manifest, or a required source file is unavailable. Missing data is never Verified.

Editing the local manifest and re-running seed does not make a record Verified. The expected hash is the one stored on the chain. Restarting `npm run dev` starts a fresh chain and anchors whatever the catalog currently approves, after restoring a leftover tamper backup.

To see **Outdated** without restarting the server, bump `recordVersion` in `sample-data/asset-profile.json` and run `npm run verify` in another terminal. The running chain still holds version 1.0.

## Benchmark

`npm run bench` measures verify latency, tamper detection, and whether the failure names `DOC-ENV-001-V2`. It writes `results/bench.json`. That latency is one run on one machine.

The baseline next to it is not a FortLedger measurement. It quotes published typical ranges: Texas commercial diligence commonly 30–60 days, industrial often 60–90 ([Chambers Real Estate 2025, USA — Texas](https://gpg-pdf.chambers.com/view/826355218/1334/); [Talley Law](https://thetalleylaw.com/real-estate/texas-commercial-property-due-diligence-guide-for-buyers/)); Phase I turnaround about 2–3 weeks ([Commercial Loans of Texas](https://commercialloansoftexas.com/texas-commercial-lending-process-application-to-closing/)); Phase I presumed viable for 180 days and generally redone after 1 year ([ASTM E1527-21 §4.6](https://www.astm.org/standards/e1527)); an ALTA/NSPS survey about 2–4 weeks ([Midpoint Surveying](https://midpointsurveying.com/services/alta-nsps-land-title-surveys)); manual lease review about 3–4 analyst-hours per lease in a lease-accounting context ([RSM](https://rsmus.com/insights/services/audit/lease-abstraction-planning-understand-related-effort-timelines.html)). `manualDiligence` stays null so those ranges are not collapsed into a fake single number.

## Competition status

FortLedger is the entry for the **HackFW MADE Challenge** (Fort Worth), **Track 04 — Tokenized Industrial Real Estate**. The Devpost deadline is **Friday, October 30, 2026, 11:00 AM CDT**.

This repository was started on **September 16, 2026** (America/Chicago), before the October 1–30, 2026 challenge window. September produced the synthetic corpus, deterministic hashing, the manifest, and the first CLI tamper check. October work added the local Hardhat anchor, the transfer-disabled record token and its tests, chain-backed verification (`verified`, `failed`, `unable_to_verify`, `outdated`), the operator UI, industrial-fit fields and citations, catalog-driven review status, tamper-backup cleanup, and the benchmark harness.

This update does not change repository visibility. No partners are claimed. The diligence ranges in the benchmark are cited published figures, not a study this project ran.

## What this demo does not do

- It does not read live county, title, survey, lease, or environmental systems.
- It does not extract text with a model. The sample values are seeded so the demo can boot.
- It does not deploy to a public network or move real funds.
- It does not authenticate operators beyond the demo issuer check in the contract.
- It covers one fictional asset. Chain state disappears when the Hardhat node stops.
- The contract reports ERC-721 interface ids and then rejects every transfer. It is not a marketplace token.

## Layout

- `sample-data/` — synthetic asset, catalog, documents, and the generated manifest
- `lib/` — hashing, chain reads, tamper backup, local node helper
- `contracts/AssetRecordToken.sol` — the record token
- `test-contracts/` — authorized mint, rejected unauthorized mint, rejected transfers
- `public/` — the operator page served by `npm run dev`
- `scripts/` — seed, manifest, anchor, verify, tamper demo, bench, dev server
- `docs/` — architecture, data model, token limits, and the demo script

## License

MIT. See `LICENSE`.
