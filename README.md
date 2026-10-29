# FortLedger

[![CI](https://github.com/benjaminrhodes/fortledger/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/benjaminrhodes/fortledger/actions/workflows/ci.yml)

FortLedger cuts the waiting out of due diligence. Every document in the deal room is checked as current and untouched in milliseconds, not days.

We turn the slowest part of a real estate deal, confirming the paperwork, into a one-click check.

> Synthetic hackathon demonstration. Not legal, title, survey, environmental, investment, securities, or tax advice.

## Run it in 2 minutes

```bash
git clone https://github.com/benjaminrhodes/fortledger.git
cd fortledger
npm run setup
npm test
npm run dev
```

Open http://127.0.0.1:4173. The page checks the record on load. A clean **Verify** shows **Verified**. The seven current files show Verified, and Phase I ESA v1 shows Superseded. Verified means those files are unchanged since they were recorded. It is not proof the files are true. Hardhat listens on http://127.0.0.1:8545. If port 4173 is busy, run `PORT=4174 npm run dev` and open the URL the log prints.

`.nvmrc` is Node 22 (`nvm use`). Node 20 or newer works. `npm run setup` checks Node, installs from the lockfile with `npm ci`, checks that local Hardhat is 2.x, and compiles the contract. That compile downloads the Solidity 0.8.24 compiler once, so the first setup needs a network.

That speed is a check of the data room you already have. In this demo, verifying the whole room takes a few milliseconds. What it removes is the manual “which version is current” re-check before closing or lender sign-off. The reports themselves are not written any faster. This repository does not claim an hours-saved number. A pilot will measure that.

You can trust the speed because each approved file is fingerprinted and the manifest hash is anchored on a local chain. **Verified** means the file is unchanged since it was recorded. It is not proof the file is true.

FortLedger demonstrates that check on one fictional Fort Worth industrial property. Seven record categories become a versioned asset record. Each displayed fact cites a source document, a location, and an excerpt, or it is marked `not_found`. A transfer-disabled asset-record token on a local Hardhat chain stores the asset id, record version, and manifest hash. Verification reads that hash from the chain and hashes the files on disk.

**HackFW MADE Challenge — Track 04, Tokenized Industrial Real Estate.** Devpost deadline: Friday, October 30, 2026, 11:00 AM CDT. Demo Day is the same day, 9:30 AM–3:00 PM CDT.

## Setup

Node.js 20 or newer. `package.json` sets `engines.node` to `>=20`. `.nvmrc` is 22 (`nvm use`). This setup is also confirmed on Node 24. No API keys.

Use `npm ci`, not `npm install`. `npm ci` installs from the lockfile and pins Hardhat 2.29.1. It is also the clean install for a presenting laptop. Stay on Hardhat 2.x. Do not upgrade to Hardhat 3. Hardhat 3 does not read `hardhat.config.cjs`, and `npm run dev` then fails with Hardhat error HHE3, "No Hardhat config file found".

`npm run setup` checks Node, runs `npm ci`, checks that local Hardhat is 2.x, and compiles. `npm test`, `npm run dev`, and `npm run demo` run the same check first (`npm run preflight` runs it alone). Node older than 20, or a Hardhat install that is not 2.x, stops with the reason and the reinstall commands.

The Solidity 0.8.24 compiler downloads during `npm run setup`, or on the first `npm test` if you skip setup. That download needs a network once. After that, `npm run dev` works offline.

By hand:

```bash
npm ci
npm test
npm run dev
```

Open http://127.0.0.1:4173. Hardhat listens on http://127.0.0.1:8545. If port 4173 is busy, stop the other server or run `PORT=4174 npm run dev` and open the URL the log prints.

Check the installed Hardhat with `./node_modules/.bin/hardhat --version`. It should print `2.29.1`. If it does not, put the lockfile back and reinstall:

```bash
git checkout -- package.json package-lock.json
rm -rf node_modules
npm ci
./node_modules/.bin/hardhat --version
```

`npm run dev` compiles the contract, starts a local Hardhat node, anchors the current manifest, and serves the operator page. The page checks the record on load. Use **Verify**, **Tamper ESA v2**, and **Restore ESA v2** to show a clean record, a failed record that names `DOC-ENV-001-V2` (`source_hash_mismatch`), and recovery. The tamper button appends a line to `sample-data/documents/phase_i_esa_v2.txt` and keeps a `.clean-demo-backup` beside it until restore. Source bytes stay on this machine. The chain stores the commitment only. The live outline is [docs/demo-script.md](docs/demo-script.md).

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

- **Verified** — the chain hash, the current approved manifest, and every approved source file match. Verified means unchanged since recorded, not proof the file is true.
- **Outdated** — a newer approved manifest supersedes the chain, and the anchored manifest's files still match the hashes that were committed.
- **Failed** — a manifest or source-file hash does not match. The result names the document.
- **Unable to verify** — the chain, the anchored manifest, or a required source file is unavailable. Missing data is never Verified.

Editing the local manifest and re-running seed does not make a record Verified. The expected hash is the one stored on the chain. Restarting `npm run dev` starts a fresh chain and anchors whatever the catalog currently approves, after restoring a leftover tamper backup.

To see **Outdated** without restarting the server, bump `recordVersion` in `sample-data/asset-profile.json` and run `npm run verify` in another terminal. The running chain still holds version 1.0.

## Benchmark

`npm run bench` measures verify latency, tamper detection, and whether the failure names `DOC-ENV-001-V2`. It rewrites `results/bench.json`. That latency is one run on one machine. In the pitch, say a few milliseconds. Do not quote this file’s mean as a universal figure, and do not turn it into hours saved. The pilot will measure how much manual version re-checking goes away.

The baseline next to it is not a FortLedger measurement. It quotes published typical ranges: Texas commercial diligence commonly 30–60 days, industrial often 60–90 ([Chambers Real Estate 2025, USA — Texas](https://gpg-pdf.chambers.com/view/826355218/1334/); [Talley Law](https://thetalleylaw.com/real-estate/texas-commercial-property-due-diligence-guide-for-buyers/)); Phase I turnaround about 2–3 weeks ([Commercial Loans of Texas](https://commercialloansoftexas.com/texas-commercial-lending-process-application-to-closing/)); Phase I presumed viable for 180 days and generally redone after 1 year ([ASTM E1527-21 §4.6](https://www.astm.org/standards/e1527)); an ALTA/NSPS survey about 2–4 weeks ([Midpoint Surveying](https://midpointsurveying.com/services/alta-nsps-land-title-surveys)); manual lease review about 3–4 analyst-hours per lease in a lease-accounting context ([RSM](https://rsmus.com/insights/services/audit/lease-abstraction-planning-understand-related-effort-timelines.html)). `manualDiligence` stays null so those ranges are not collapsed into a fake single number.

## Competition status

FortLedger is the entry for the **HackFW MADE Challenge** (Fort Worth), **Track 04 — Tokenized Industrial Real Estate**. The Devpost deadline is **Friday, October 30, 2026, 11:00 AM CDT**. Demo Day is **Friday, October 30, 2026, 9:30 AM–3:00 PM CDT**.

Repository history starts **September 16, 2026** (America/Chicago), before the October 1–30, 2026 challenge window. September produced the synthetic corpus, deterministic hashing, the manifest, and the first CLI tamper check. October work added the local Hardhat anchor, the transfer-disabled record token and its tests, chain-backed verification (`verified`, `failed`, `unable_to_verify`, `outdated`), the operator UI, industrial-fit fields and citations, catalog-driven review status, tamper-backup cleanup, and the benchmark harness. That October work is pull request #1.

This update does not change repository visibility. No partners are claimed. The diligence ranges in the benchmark are cited published figures, not a study this project ran. Spoken pitch, judge answers, and the Demo Day checklist are in [docs/pitch-script.md](docs/pitch-script.md), [docs/judge-qa.md](docs/judge-qa.md), and [docs/prep-checklist.md](docs/prep-checklist.md).

## What this demo does not do

- It does not read live county, title, survey, lease, or environmental systems.
- It does not extract text with a model. The sample values are seeded so the demo can boot.
- It does not deploy to a public network or move real funds.
- It does not authenticate operators beyond the demo issuer check in the contract.
- It covers one fictional asset. Chain state disappears when the Hardhat node stops.
- The contract reports ERC-721 interface ids and then rejects every transfer. It is not a marketplace token.
- It does not salt hashes, run a permissioned production chain, or hold firm signing keys. [docs/security.md](docs/security.md) separates what this demo does from what is only planned.

## Layout

- `sample-data/` — synthetic asset, catalog, documents, and the generated manifest
- `lib/` — hashing, chain reads, tamper backup, local node helper
- `contracts/AssetRecordToken.sol` — the record token
- `test-contracts/` — authorized mint, rejected unauthorized mint, rejected transfers
- `public/` — the operator page served by `npm run dev`
- `scripts/` — seed, manifest, anchor, verify, tamper demo, bench, dev server, preflight
- `.nvmrc` — Node 22
- `.github/workflows/ci.yml` — `npm ci` and `npm test` on Node 20 and Node 22
- `docs/` — pitch script, live demo outline, judge Q&A, prep checklist, counsel security notes, architecture, data model, token limits, and the demo engineering checklist

## License

MIT. See `LICENSE`.
