# Draft Devpost Submission

## Project name
FortLedger

## Elevator pitch
FortLedger cuts the waiting out of due diligence. Every document in the deal room is checked as current and untouched in milliseconds, not days.

We turn the slowest part of a real estate deal, confirming the paperwork, into a one-click check.

The speed is the re-check of a data room that already exists: the whole room verifies in a few milliseconds, which is what removes the manual “which version is current” pass before closing or lender sign-off. The reports are not written faster. No hours-saved number is claimed. A pilot will measure that. The check can be trusted because each approved file is fingerprinted and the manifest hash is anchored on a local chain. Verified means unchanged since recorded, not proof the file is true.

## Problem
In Texas, commercial due diligence commonly runs 30–60 days, and industrial deals often run 60–90 ([Chambers Real Estate 2025, USA — Texas](https://gpg-pdf.chambers.com/view/826355218/1334/); [Talley Law](https://thetalleylaw.com/real-estate/texas-commercial-property-due-diligence-guide-for-buyers/)). The wait is split across title, survey, zoning, environmental, lease, rent-roll, and operating-cost records, and each one has its own clock. A Phase I environmental site assessment takes about 2–3 weeks and is presumed viable for 180 days, then generally redone after a year ([ASTM E1527-21 §4.6](https://www.astm.org/standards/e1527)). An ALTA/NSPS survey takes about 2–4 weeks ([Midpoint Surveying](https://midpointsurveying.com/services/alta-nsps-land-title-surveys)). A title commitment takes 5–10 business days ([1st Option Title](https://1stoptiontitle.com/faqs/)). Abstracting one lease takes about 3–4 analyst-hours ([RSM](https://rsmus.com/insights/services/audit/lease-abstraction-planning-understand-related-effort-timelines.html)). Versions change during the deal, and someone still confirms by hand which copy is current before closing or lender sign-off.

DFW has 33.9 million square feet of industrial space under construction, more than any other US market, with 7.8% vacancy (CBRE, Q3 2026). That is a lot of deals waiting on the same confirmation step.

## What we built
A seeded Fort Worth demonstration asset (`FL-TX-FW-0001`) with seven record categories and eight files, including an environmental v1 superseded by v2. Material facts and industrial-fit fields carry a source document, location, and excerpt, or they are marked `not_found` (floor load). Review status comes from a catalog. The app builds a deterministic manifest, mints a transfer-disabled asset-record token on a local Hardhat chain, reads that hash back, and names the changed document after a reversible tamper. `npm run dev` serves the operator page. One click verifies the room.

On the sample asset, as of 2026-10-24, Phase I v1 shows Stale at 418 days and v2 shows Viable at 53 days under the ASTM E1527-21 180-day rule. Stale does not by itself change the hash result. `npm run bench` records verify latency and tamper detection: 20 of 20 tampers caught, and 20 of 20 named the right document. Say a few milliseconds. The published day, week, and hour ranges above were not measured here, and they are not a claim that reports get written faster.

## Honest scope disclosure
The demo uses synthetic, watermarked documents and seeded values. It is not legal, title, investment, or securities infrastructure. The token represents only the integrity and version of a digital property-record manifest. Live AI extraction is not implemented. No partners are claimed. No hours-saved figure is claimed.

## Technologies
Node.js, a dependency-free operator page, SHA-256 via `node:crypto`, local JSON, Solidity, Hardhat, and ethers. The record token is a small contract in this repo, not an OpenZeppelin import.

## AI tools used

[Fill in before submission.]

## Demo and links
- Run: `npm ci`, `npm test`, `npm run dev`, then http://127.0.0.1:4173 (Hardhat on http://127.0.0.1:8545). If that page port is busy: `PORT=4174 npm run dev`.
- Spoken pitch: `docs/pitch-script.md`. Live clicks: `docs/demo-script.md`.
- Demo video: not recorded yet. A person still needs to capture the screen for Devpost.
- Track: HackFW MADE Challenge, Track 04 — Tokenized Industrial Real Estate. Select Track 04 on the form.
- Deadline: Friday, October 30, 2026, 11:00 AM CDT. Demo Day is the same day, 9:30 AM–3:00 PM CDT.

## Eligibility note

Repository history starts September 16, 2026 (America/Chicago), before the October 1–30, 2026 window. September produced the corpus and hashing CLI. The chain anchor, token, operator UI, citations, and benchmark were added in October and are in pull request #1.

[Fill in before submission: eligibility conclusion after checking this draft against the event page.]

Repository visibility was not changed here.
