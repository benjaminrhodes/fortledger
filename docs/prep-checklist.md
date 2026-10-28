# Demo Day prep

HackFW MADE Challenge, Track 04. Fort Worth. Friday, October 30, 2026.

Devpost closes **11:00 AM CDT**. Demo Day runs **9:30 AM–3:00 PM CDT** the same day. Submit the night before. Friday morning is for the room, not for the form.

Spoken script: [pitch-script.md](pitch-script.md). Clicks: [demo-script.md](demo-script.md). Answers: [judge-qa.md](judge-qa.md).

## Submit early

- [ ] Submit on Devpost before Friday, October 30, 2026, 11:00 AM CDT. Do not leave it for the 9:30 AM start of Demo Day.
- [ ] Make this repository public. This checklist does not change visibility for you.
- [ ] Record the demo video and upload it. The repo does not contain a video yet. Follow [demo-script.md](demo-script.md): Verify, Tamper ESA v2, Verify (names `DOC-ENV-001-V2`, `source_hash_mismatch`), Restore ESA v2, Verify. Say that Verified means unchanged since recorded, not proof it is true.
- [ ] Fill the blanks in [devpost-draft.md](devpost-draft.md): **AI tools used**, and the **eligibility** conclusion. Leave them blank until you write them. The September 16, 2026 start date stays disclosed either way.
- [ ] Select **Track 04 — Tokenized Industrial Real Estate**.
- [ ] Register on [talent.fwtx.city](https://talent.fwtx.city).
- [ ] Register on the Luma event page.

## Rehearse

- [ ] Read the 4-minute script out loud three times with a timer. Land the close by 4:15. Opening line and repeatable line stay word for word.
- [ ] Run the 3-minute cut in [pitch-script.md](pitch-script.md) once, so a short slot is not a surprise.
- [ ] Practice the questions in [judge-qa.md](judge-qa.md), including “why a blockchain,” a bad file getting anchored, who pays in Fort Worth and elsewhere, why the repo starts before October 1, and what Verified means. If they ask for hours saved, say the pilot will measure it. Do not invent a number.
- [ ] On the presenting laptop, while you still have a network: `npm ci` and `npm test`. Confirm `git status` is clean.
- [ ] Disconnect the network and do a full dry run: `npm run dev`, wait for `Press Ctrl+C to stop.`, open http://127.0.0.1:4173, and click the whole flow in [demo-script.md](demo-script.md). Hardhat is on port 8545.
- [ ] Do not run `npm run bench` on that laptop. It rewrites `results/bench.json`.

## Morning of October 30

- [ ] App already running before you walk in. Log shows `Press Ctrl+C to stop.` Page already shows Verified.
- [ ] Browser zoom about 125%. The status word and `DOC-ENV-001-V2` should be readable from a few feet away.
- [ ] Notifications off. Extra browser tabs closed.
- [ ] PDF of the deck on the laptop, separate from the slide software.
- [ ] Recorded video on the laptop and on a phone.
- [ ] If port 4173 is taken: Ctrl+C the old server, or `PORT=4174 npm run dev`, and open the URL the log prints.
- [ ] If startup prints `Refusing to anchor`: `git checkout -- sample-data/documents/phase_i_esa_v2.txt`, then start again. Do not mix a hand edit with the Tamper button.

## If the demo fails in the room

Stop. Go back to the slides. Talk through the results (20 of 20 caught, 20 of 20 named, a few milliseconds, synthetic asset). Play the recorded video. The appendix cues are at the bottom of [pitch-script.md](pitch-script.md).
