# Judge questions

Short answers for Demo Day. Speak the first sentence, then stop unless they ask more. The pitch leads with speed. Integrity is why that speed can be trusted.

If they ask how many hours it saves: there is no hours-saved number. Verifying this data room takes a few milliseconds. That is the manual “which version is current” re-check before closing or lender sign-off, not faster report writing. The pilot will measure the wait it removes.

## Why a blockchain, not a database?

A timestamped record neither side can quietly rewrite. That is why both sides can trust a check that comes back in a few milliseconds. The demo chain is local Hardhat. A permissioned or public chain is later, not this build. The files stay with the owner. Only fingerprints are recorded.

## What stops a bad file from being anchored?

Two different cases.

If the bytes on disk do not match the hash already recorded for that approved file, startup prints `Refusing to anchor` and will not mint. That check exists today.

If the file was wrong when someone chose to record it, and the bytes match that choice, the anchor succeeds. Nothing in this demo reads the report and decides it is true. `human_verified` is a catalog input, not a test of the contents. Verified means unchanged since recorded, not proof it is true. Title insurance and legal review are still required.

## Who pays, in Fort Worth and in other cities?

Brokers, lenders, and title firms. Per deal room or per asset, with a monthly plan for volume. The first ask is one Fort Worth industrial pilot. The same confirmation step shows up in Dallas, Houston, Phoenix, and the Inland Empire, and document rules differ by state, so the pilot stays in Fort Worth until a real room has been measured. DFW has 33.9 million square feet of industrial under construction, the most in the US, and 7.8% vacancy (CBRE, Q3 2026). That is the reason to start in this market.

## Why does the repo start before October 1?

Repository history starts September 16, 2026, before the October 1–30 window. September was the synthetic corpus and the hashing CLI. The hackathon work is in pull request #1: the chain, the token, the operator page, and the benchmark. Say that plainly. The eligibility conclusion is still a blank in [devpost-draft.md](devpost-draft.md). Do not invent it on stage.

## What does Verified mean?

Verified means unchanged since recorded, not proof it is true. On a clean run the page says Verified in a few milliseconds. The seven current files show Verified. ESA v1 shows Superseded, and as of 2026-10-24 it is Stale at 418 days. ESA v2 is Viable at 53 days, under the ASTM E1527-21 180-day rule. Stale is a date flag. It is not a hash failure. A changed file comes back Failed and names the document. In the demo that is `DOC-ENV-001-V2`, `source_hash_mismatch`.

## Where do the files live?

They stay with the owner. Only fingerprints are recorded. The token stores the asset id, the record version, the manifest hash, and a manifest URI. It does not store the document.

## Is the token a security?

No. Transfers are disabled. `legal_title` is false. `investment_rights` is false. It is a record of a manifest, not title, equity, debt, rent, or an investment.

## What is real, and what is the demo?

The asset `FL-TX-FW-0001` is synthetic. The day, week, and hour ranges are published figures: Texas diligence commonly 30–60 days and industrial often 60–90, Phase I about 2–3 weeks and viable for 180 days, an ALTA survey about 2–4 weeks, a title commitment 5–10 business days, lease abstraction about 3–4 hours. Measured here: 20 of 20 tampers caught, and 20 of 20 times the right document was named, in a few milliseconds. One run, one machine. Do not quote a tighter number from `results/bench.json` on stage.

## What is next?

One Fort Worth broker, lender, or title-firm pilot, then data-room integrations. The pilot is where a time-saved figure would be measured. It is not measured yet.

## Is it secure?

Hashes do not expose the documents, but they can leak timing and they can be guessed if a file is predictable. The salt, the permissioned production chain, and the firm key controls are planned. They are not in this demo. Today the chain is local, the files are synthetic, and only an authorized issuer can mint, using a public Hardhat demo key. FortLedger proves a file has not changed. It does not replace legal review. Longer version: [security.md](security.md).
