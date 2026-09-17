# FortLedger Project Status

Updated: 2026-09-16 (America/Chicago)

## Completed milestones

- Workspace inspected; no existing FortLedger project or local Git repository found.
- GitHub auth verified for `benjaminrhodes`; repository was absent before creation.
- Private repository created and verified: https://github.com/benjaminrhodes/fortledger
- Product scope and token semantics committed in the initial README.
- Seeded source model created: 8 synthetic document versions across all 7 required categories.
- Deterministic SHA-256 hashing and canonical manifest generation implemented.
- Reversible tamper demonstration implemented and exercised against the actual source file.
- Architecture, data-model, security, token, timed-demo, eight-slide plan, and Devpost draft packaged in `docs/` and `deck/`.
- Recording tools `ffmpeg` and `obs` are available, but no UI recording has been made yet.

## Exact verification evidence

- Clean verification: `verified`, manifest `sha256:25c8fee3310c95c9bd9870b4cee868abd8a2d35a463babe7363055a38cbed1b8`, 7 approved documents.
- Tampered verification: `failed`; affected record `DOC-ENV-001-V2`, source `sample-data/documents/phase_i_esa_v2.txt`.
- Tamper restore verification: `verified` with the same manifest hash.
- Tamper expected hash: `sha256:0b031d862f7b473a16a235e9b0ef9547a8637c6bb6af797c7bee5fd9f0916f93`.
- Tamper actual hash: `sha256:0d67abfb8851546cba4654bc118fc06a6854638c32db0de518d6292b48655d10`.

## Commands and results

- `gh auth status` — authenticated as `benjaminrhodes`, `repo` scope.
- `gh repo view benjaminrhodes/fortledger --json ...` — private, default branch `main`.
- `npm run seed` — passed; seeded 8 versions across 7 categories.
- `npm run manifest` — passed; 7 documents included.
- `npm test` — passed; 3 tests, 0 failures.
- `npm run build` — passed checkpoint artifact check.
- `node scripts/verify.mjs` — passed clean verification.
- `node scripts/tamper-demo.mjs` — passed failed-and-restored demonstration.
- `git push` — passed through commit `bbd7a30`; local branch clean and aligned with `origin/main`.

## Unresolved event questions

1. What is the exact Devpost event URL/name?
2. Is October 1, 2026 the submission-opening date, official build start, or another milestone?
3. Is pre-event development allowed, and if so, what must be disclosed?
4. What are the final video duration, repository visibility, AI disclosure, team-size, and screenshot requirements?

## Next action

Implement the application-facing seven-category data model and verification UI, then add the local token contract and its authorized/unauthorized behavior tests.
