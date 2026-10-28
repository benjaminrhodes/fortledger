# FortLedger deck

The spoken pitch is [docs/pitch-script.md](../docs/pitch-script.md). It is eleven timed slides plus four appendix slides. The pitch leads with diligence speed. Integrity is why that speed can be trusted.

Demo Day is Friday, October 30, 2026, 9:30 AM–3:00 PM CDT. Devpost closes the same day at 11:00 AM CDT.

| Slide | Time | Title |
| --- | --- | --- |
| 1 | 0:00–0:15 | Title. Opening line on diligence speed. |
| 2 | 0:15–0:40 | Bottleneck. Texas 30–60 days, industrial often 60–90. |
| 3 | 0:40–1:05 | Why so long. Report clocks, then the manual version re-check. |
| 4 | 1:05–1:20 | Why now. DFW industrial construction, CBRE Q3 2026. |
| 5 | 1:20–1:40 | Record types. Synthetic `FL-TX-FW-0001`, eight files, Stale 418d / Viable 53d. |
| 6 | 1:40–1:50 | What we built. The one-click line. |
| 7 | 1:50–3:05 | Live demo. Clicks in [docs/demo-script.md](../docs/demo-script.md). |
| 8 | 3:05–3:25 | How it works. Fingerprints on a chain neither side can quietly rewrite. |
| 9 | 3:25–3:45 | Results. 20/20, a few milliseconds. No hours-saved number. |
| 10 | 3:45–4:05 | Pilot and ask. One Fort Worth room. |
| 11 | 4:05–4:15 | Close. Repeat the one-click line. |

Appendix, only if asked: A architecture (slide 12), B threat model (13), C security (14), D scope and the September 16, 2026 start (15).

The running demo is `npm run dev`. Hardhat is at http://127.0.0.1:8545. The page is at http://127.0.0.1:4173. If that port is busy, `PORT=4174 npm run dev`.

Speaker notes should say the asset and the source files are synthetic, extraction is seeded, the anchor is local Hardhat, and repository history starts September 16, 2026, before the October 1–30 window. Diligence ranges are published figures. The 20 of 20 tamper result is this project’s measurement. Say a few milliseconds. The pilot will measure time saved. `npm run bench` rewrites `results/bench.json`.
