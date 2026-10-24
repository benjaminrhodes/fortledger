# Demo script (about 4 minutes)

Start with `npm run dev` and open http://127.0.0.1:4173. The page loads the fictional asset and runs verification itself. The CLI equivalent of the tamper cycle is `npm run tamper-demo`.

**0:00–0:20 — Problem.** Industrial diligence is split across title, survey, zoning, environmental, lease, rent-roll, and cost files. After a version changes, it is hard to show which bytes a claim came from.

**0:20–0:45 — Asset.** Point at the synthetic banner and `FL-TX-FW-0001`, Fort Worth Rosedale Logistics Center. Say the property is fictional.

**0:45–1:10 — Seven categories.** Scroll the record list. Environmental Phase I v1 is badged superseded and stale (report date 2025-09-01, more than 180 days before the as-of date, ASTM E1527-21 §4.6). v2 is current and inside that window. Only the current human-verified file is in the approved manifest. Stale does not by itself mean the hash failed.

**1:10–1:40 — Citation.** In Field citations, read Legal owner: document `DOC-TITLE-001`, location `Field: Legal owner`, and the excerpt. Say the value was seeded from that line so the demo can boot. There is no live extractor.

**1:40–2:05 — Industrial fit.** Power, clear height, dock doors, and transport access cite the synthetic survey. Floor load is `not_found`. Nothing was filled in for it.

**2:05–2:35 — Anchor.** On the anchor card, show the contract, token id, manifest hash, `legal_title false`, `investment_rights false`, and transfers `disabled`. Source files stayed on this machine.

**2:35–2:55 — Verify.** The status is already Verified, and both hashes match. Click **Verify** to run it again.

**2:55–3:25 — Tamper.** Click **Tamper ESA v2**. Status becomes Failed. The mismatch names `DOC-ENV-001-V2`.

**3:25–3:45 — Restore.** Click **Restore ESA v2**. Status returns to Verified. The backup file is removed.

**3:45–4:00 — Close.** FortLedger does not tokenize the building. It makes one reviewed digital record checkable. If someone asks about speed, open `results/bench.json`. The latency is one local run. The diligence ranges beside it are published figures (30–60 days commercial, often 60–90 industrial; Phase I about 2–3 weeks and viable for 180 days; ALTA/NSPS about 2–4 weeks; lease review about 3–4 analyst-hours), not a clock this demo ran.
