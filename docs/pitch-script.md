# Pitch script (about 4 minutes)

Spoken notes for Demo Day. The pitch leads with diligence speed. Data integrity is why the speed can be trusted. It is not the headline.

Say these two lines as written.

- Opening: “FortLedger cuts the waiting out of due diligence. Every document in the deal room is checked as current and untouched in milliseconds, not days.”
- Repeatable line: “We turn the slowest part of a real estate deal, confirming the paperwork, into a one-click check.”

The repeatable line replaces “change one byte, and it names the exact document” as the tagline. The tamper demo still shows that naming behavior. Do not claim the reports get written faster, and do not invent an hours-saved number. Say the pilot will measure it. Verification of this data room is a few milliseconds.

Slides 12–15 are appendix only. They are outside the 4:15. Cues are at the bottom. Click path for slide 7: [demo-script.md](demo-script.md).

## Slide 1, Title (0:00–0:15)

“I’m Benjamin. FortLedger cuts the waiting out of due diligence. Every document in the deal room is checked as current and untouched in milliseconds, not days.”

## Slide 2, Bottleneck (0:15–0:40)

“In Texas, due diligence takes 30 to 60 days, and industrial deals often take 60 to 90. The wait is seven kinds of records, from the title company, the surveyor, the city, the environmental consultant, the seller, and the tenants. Before closing, someone still has to confirm which copy is the current one.”

## Slide 3, Why so long (0:40–1:05)

“Each report runs on its own clock. A Phase I takes two to three weeks, stays viable for 180 days, and is generally redone after a year. An ALTA survey takes two to four weeks. A title commitment takes five to ten business days. One lease takes three to four hours to abstract. Versions change during that wait, and someone still checks by hand which copy is current. We cut that re-check. The reports are not written faster.”

## Slide 4, Why now (1:05–1:20)

“DFW has 33.9 million square feet of industrial space under construction, more than any other US market, and vacancy is 7.8 percent. That is CBRE, third quarter 2026. A lot of deals are in line for the same confirmation.”

## Slide 5, Record types (1:20–1:40)

“This asset is synthetic: FL-TX-FW-0001, a Fort Worth logistics center. FortLedger fingerprints all eight files: title, survey, zoning, both versions of the environmental report, the lease, the rent roll, and the operating costs. As of October 24, 2026, the old Phase I shows Stale, 418 days, and the current one shows Viable, 53 days, under the 180-day rule.”

## Slide 6, What we built (1:40–1:50)

“We turn the slowest part of a real estate deal, confirming the paperwork, into a one-click check. Let me show you.”

## Slide 7, Live demo (1:50–3:05)

[Switch to the browser. The app is already on http://127.0.0.1:4173.]

[Click Verify.] “Eight files, checked in a few milliseconds. The current ones are Verified.”

[Point at the ESA rows.] “The old report is Stale, 418 days. The current one is Viable, 53 days. Same 180-day rule, as of October 24.”

[Click Tamper ESA v2, then Verify.] “I appended one line to the current environmental report. The check fails immediately and names the document: DOC-ENV-001-V2, source hash mismatch.”

[Click Restore ESA v2, then Verify.] “Put the original back, and it is Verified again.”

“Verified means unchanged since recorded, not proof it’s true. Whether the report is right is still the lawyers’ job. What used to be a manual pass through the data room is this click.”

[If the demo fails: go back to the slides, talk through slide 9, and play the recorded video.]

## Slide 8, How it works (3:05–3:25)

“The documents stay on the owner’s machine. Only fingerprints go on the chain. That record is timestamped, and neither side can quietly rewrite it, so both sides can trust a check that comes back in milliseconds. The token is a record of the manifest. It is not a title, and it cannot be transferred.”

## Slide 9, Results (3:25–3:45)

“We tampered 20 times. FortLedger caught all 20 and named the document every time, in a few milliseconds. The asset is synthetic, the day and week ranges are published, and the 20 out of 20 is our measurement. We have no hours-saved number. The pilot will measure that.”

## Slide 10, Pilot and ask (3:45–4:05)

“Next is one pilot in a real Fort Worth industrial deal room. We will measure the waiting it removes before closing and lender sign-off. We are asking for introductions to brokers, lenders, and title firms who want to try it.”

## Slide 11, Close (4:05–4:15)

“We turn the slowest part of a real estate deal, confirming the paperwork, into a one-click check. The repo is on the QR code. Thank you, and I’m happy to take questions.”

## Three-minute cut

Use this if the room cuts you to three minutes. Keep both signature lines, the tamper, the Stale / Viable point, and the “Verified is not truth” sentence. Drop vacancy, the lease-hour figure, and the survey and title clocks if you are still long at 0:45. Do not open the appendix unless they ask.

| Slide | Time | Say |
| --- | --- | --- |
| 1 Title | 0:00–0:10 | “I’m Benjamin. FortLedger cuts the waiting out of due diligence. Every document in the deal room is checked as current and untouched in milliseconds, not days.” |
| 2 Bottleneck | 0:10–0:25 | “Texas diligence is 30 to 60 days, industrial often 60 to 90, across seven kinds of records. Someone still re-checks which copy is current.” |
| 3 Why so long | 0:25–0:40 | “A Phase I takes two to three weeks and is viable for 180 days. Versions change while you wait. We are not writing the reports faster. We are cutting that re-check.” |
| 4 Why now | 0:40–0:50 | “DFW has 33.9 million square feet of industrial under construction, the most in the US. CBRE, third quarter 2026. Same slow confirmation, many deals.” |
| 5 Record types | 0:50–1:05 | “Synthetic asset FL-TX-FW-0001. Eight files. Old Phase I is Stale at 418 days. Current one is Viable at 53. As of October 24, 180-day rule.” |
| 6 What we built | 1:05–1:12 | “We turn the slowest part of a real estate deal, confirming the paperwork, into a one-click check.” |
| 7 Live demo | 1:12–2:15 | Verify. Point at Stale 418d and Viable 53d. Tamper ESA v2, Verify, name DOC-ENV-001-V2, source hash mismatch. Restore, Verify. “Verified means unchanged since recorded, not proof it’s true.” |
| 8 How it works | 2:15–2:28 | “Files stay on the machine. Fingerprints go on a chain neither side can quietly rewrite. The token is a record, not a title, and it cannot be transferred.” |
| 9 Results | 2:28–2:42 | “20 of 20 tampers caught and named, in a few milliseconds. Synthetic asset. Our measurement. No hours-saved number. The pilot will measure it.” |
| 10 Pilot and ask | 2:42–2:52 | “One Fort Worth industrial pilot. Introductions to brokers, lenders, and title firms.” |
| 11 Close | 2:52–3:00 | “We turn the slowest part of a real estate deal, confirming the paperwork, into a one-click check. Thank you.” |

## When to pull the appendix

Stay on the timed slides unless a question needs the backup. Then open the matching slide and use one sentence. Details live in [architecture.md](architecture.md), [security.md](security.md), and [judge-qa.md](judge-qa.md).

- **Appendix A, architecture (slide 12).** Pull it if they ask how it is built, where the files live, or what is actually written on the chain. “The files stay on the machine. The chain stores the asset id, the record version, and the manifest hash.”
- **Appendix B, threat model (slide 13).** Pull it if they ask what an attacker can do, what stops a bad file, or who is allowed to record. “We prove the file is unchanged. We do not prove it was true when it was recorded. Only the authorized issuer can mint, and in this demo that key is a public Hardhat key.”
- **Appendix C, security (slide 14).** Pull it if they ask whether hashes on a chain are safe for a law firm or a title company, or “is it secure?” Use the short answer in [security.md](security.md), and say which pieces are planned.
- **Appendix D, scope and the September start (slide 15).** Pull it if they ask what is real, when the repo started, or why there are commits before October 1. “The asset is synthetic. Repository history starts September 16, 2026, before the October 1 window. The hackathon work is in pull request #1.” Leave the eligibility conclusion to the blank in [devpost-draft.md](devpost-draft.md). Do not fill it from the stage.
