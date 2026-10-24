# Draft Devpost Submission

## Project name
FortLedger

## Elevator pitch
FortLedger turns a fragmented industrial-property file set into a source-backed record whose approved manifest is anchored on a local chain and can be checked for tampering.

## Problem
Property diligence facts are spread across title, survey, zoning, environmental, lease, rent-roll, and operating-cost records. Reviewers need the value, the exact version and source behind it, and a way to tell if the file changed afterward.

## What we built
A seeded Fort Worth demonstration asset with seven record categories, including an environmental v1 superseded by v2. Material facts and industrial-fit fields carry a source document, location, and excerpt, or they are marked `not_found` (floor load). Review status comes from a catalog. The app builds a deterministic manifest, mints a transfer-disabled asset-record token on a local Hardhat chain, reads that hash back, and names the changed document after a reversible tamper. `npm run dev` serves the operator page. `npm run bench` records verify latency and tamper detection. Next to that, it cites published typical ranges (Texas commercial diligence commonly 30–60 days, industrial often 60–90; Phase I about 2–3 weeks and viable for 180 days; ALTA/NSPS about 2–4 weeks; lease review about 3–4 analyst-hours). Those ranges were not measured here. A Phase I report date older than 180 days is flagged stale and does not change the hash result.

## Honest scope disclosure
The demo uses synthetic, watermarked documents and seeded values. It is not legal, title, investment, or securities infrastructure. The token represents only the integrity and version of a digital property-record manifest. Live AI extraction is not implemented. No partners are claimed.

## Technologies
Node.js, a dependency-free operator page, SHA-256 via `node:crypto`, local JSON, Solidity, Hardhat, and ethers. The record token is a small contract in this repo, not an OpenZeppelin import. AI-assisted development should be disclosed with the tools actually used before submission.

## Demo and links
- Run: `npm install`, `npm test`, `npm run dev`, then http://127.0.0.1:4173
- Demo video: not recorded yet. A person still needs to capture the screen for Devpost.
- Track: HackFW MADE Challenge, Track 04 — Tokenized Industrial Real Estate.
- Deadline: Friday, October 30, 2026, 11:00 AM CDT.

## Eligibility note
Repository history begins September 16, 2026, before the October 1–30, 2026 window. September produced the corpus and hashing CLI. The chain anchor, token, operator UI, citations, and benchmark were added in October. This draft still has to be checked against the event page before submission. Repository visibility was not changed here.
