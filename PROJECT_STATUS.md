# FortLedger Project Status

Updated: 2026-10-24

## What works

- Seven synthetic Fort Worth record categories, with Phase I ESA v1 superseded by v2.
- Review status is read from `sample-data/catalog.json`. Missing status fails the seed. `pending_review` stays out of the manifest.
- Industrial-fit fields: power, clear height, dock doors, transport access, and floor load. Floor load is `not_found`. Cited values quote an exact line from a synthetic source file.
- `contracts/AssetRecordToken.sol` on a local Hardhat chain. The issuer can mint. Other accounts cannot. Transfers and approvals revert. `legal_title` and `investment_rights` are false.
- `npm run dev` starts the chain, anchors the manifest, and serves http://127.0.0.1:4173 with Verify, Tamper ESA v2, and Restore ESA v2.
- `verify` reads the expected manifest hash from the chain. A closed RPC port or a missing approved file returns `unable_to_verify`. A changed source file returns `failed` and names the document. A newer intact manifest returns `outdated`.
- The tamper demo restores the synthetic file and deletes `*.clean-demo-backup` in a `finally` block. That suffix is gitignored.
- `npm run bench` writes `results/bench.json`. Latency and tamper rates are measured. The baseline quotes published typical ranges and leaves `manualDiligence` null.
- Phase I report dates are checked against a 180-day viability window (ASTM E1527-21 §4.6). Stale is a separate flag. It does not change a hash match into Failed or Outdated.

## Evidence from this workspace (2026-10-24)

- `npm test`: 21 Node tests passed, then Hardhat `AssetRecordToken` 3 passing (authorized mint, unauthorized mint, transfers). Phase I v1 (report date 2025-09-01) is stale against as-of 2026-10-24; v2 (2026-09-01) is inside 180 days. The hash status stays verified.
- Approved manifest hash: `sha256:e754149855d6ebe517da38d525d965b5c8bab84097c18bd9e4957c41128771d2` (7 documents; ESA v1 excluded).
- `npm run tamper-demo`: `verified`, then `failed` on `DOC-ENV-001-V2` (`source_hash_mismatch`), then `verified` again. Chain token `0x5FbDB2315678afecb367f032d93F642f64180aa3`, token id 1.
- `results/bench.json` at `2026-10-24T22:43:04.630Z` (Node v22.23.4, linux x64, one run): verify mean 3.138 ms over 50 iterations after one warmup; tamper detection 20/20; correct document id 20/20. Baseline ranges are cited, not measured here: commercial diligence commonly 30–60 days (industrial often 60–90; Chambers Real Estate 2025 USA-Texas; Talley Law), Phase I turnaround about 2–3 weeks (Commercial Loans of Texas), Phase I viable 180 days (ASTM E1527-21 §4.6), ALTA/NSPS survey about 2–4 weeks (Midpoint Surveying), lease review about 3–4 analyst-hours per lease (RSM).

Re-run the commands after a clone. Do not treat the latency number as a portable benchmark.

## Competition

HackFW MADE Challenge, Track 04 — Tokenized Industrial Real Estate. Devpost deadline Friday, October 30, 2026, 11:00 AM CDT.

Repository history begins September 16, 2026, before the October 1–30 window. September was the corpus and the hashing CLI. October added the anchor, token, UI, citations, status paths, and benchmark. Visibility of the GitHub repository was not changed in this update.

## Still open

- No live document extraction, OCR, or county integration.
- No public-network deployment and no production access control.
- No single manual-diligence duration was measured. The benchmark cites published ranges instead.
- Devpost still needs a human screen recording. No video is stored in this repo.
- One fictional asset. Hardhat state is ephemeral.
