# Live demo outline

Use this for the live Demo Day run and for the recording. The spoken surround is [pitch-script.md](pitch-script.md), slide 7 (1:50–3:05). If the demo breaks, stop clicking, go back to the slides, talk through the results, and play the recorded video.

## Start

From a clean tree (`git status` shows nothing you do not expect):

```bash
npm ci
npm test
npm run dev
```

`npm ci` and the first `npm test` need a network. The test downloads the Solidity 0.8.24 compiler. After that, the demo works offline.

Wait until the log prints `Press Ctrl+C to stop.` Hardhat is at http://127.0.0.1:8545. The operator page is at http://127.0.0.1:4173. The page verifies on load.

If port 4173 is busy, stop the old server (Ctrl+C) or run `PORT=4174 npm run dev` and open the URL the log prints (http://127.0.0.1:4174). The chain port stays 8545.

Browser zoom about 125%. Notifications off.

## Flow

The room has eight files: title, survey, zoning, Phase I ESA v1, Phase I ESA v2, lease, rent roll, and operating costs. Asset `FL-TX-FW-0001`, as of 2026-10-24.

1. **Verify.** Click **Verify**. The page status is **Verified** within a few milliseconds. The seven current files show Verified. ESA v1 is the superseded copy, so its row says Superseded rather than Verified. It is still checked. It is not a hash failure.
2. **Tamper ESA v2.** Click **Tamper ESA v2**. The button appends a line to `sample-data/documents/phase_i_esa_v2.txt` (`TAMPER DEMO: unauthorized byte change.`) and copies the clean file to `sample-data/documents/phase_i_esa_v2.txt.clean-demo-backup`.
3. **Verify fails.** Click **Verify** again. Status is **Failed**. The mismatch names `DOC-ENV-001-V2` and `source_hash_mismatch`. Untouched current files show Intact on that failed check. That is the naming behavior: one changed file, named.
4. **Restore ESA v2.** Click **Restore ESA v2**. The backup is copied back and the `.clean-demo-backup` file is removed.
5. **Verify passes.** Click **Verify**. Status is **Verified** again.

While the room is up, point at the environmental rows. As of 2026-10-24, under ASTM E1527-21 §4.6 (180-day viability):

- ESA v1: **Stale · 418d** (report date 2025-09-01)
- ESA v2: **Viable · 53d** (report date 2026-09-01)

Say this out loud: “Verified means unchanged since recorded, not proof it’s true.”

The tamper still shows the old demo behavior: change the file, and the check names that document. The line to repeat for the pitch is the speed line, not that sentence. See [pitch-script.md](pitch-script.md).

Out of time: Verify, Tamper, Verify, Restore. Skip the second passing Verify only if you must.

Optional, if a judge is already looking at the anchor card: `legal_title` false, `investment_rights` false, transfers disabled. Source bytes stayed on this machine.

## Gotchas

- Do not mix a hand edit with the **Tamper ESA v2** button. The button’s backup is whatever was on disk the first time it ran. Restore then puts that copy back, so a hand edit plus the button does not return to the committed file.
- Undo a hand edit with `git checkout -- sample-data/documents/phase_i_esa_v2.txt` from the repository root, then Verify. Do that before you click Tamper.
- A dirty approved file at startup prints `Refusing to anchor` and names the document. The server restores a leftover `.clean-demo-backup` before it anchors, but a hand edit with no backup is refused. Fix the file with the checkout command above and start `npm run dev` again.
- After `npm ci` and `npm test` have succeeded once on that machine, the demo works offline. Do the online install and test before you travel.
- `npm run bench` rewrites `results/bench.json`. Do not run it on the presenting laptop if you need a clean tree or the committed bench file. Latency moves from machine to machine. Say “a few milliseconds.”

## If it breaks

Leave the browser. Go back to the slides. Talk through the results: 20 of 20 tampers caught, 20 of 20 named the right document, a few milliseconds, synthetic asset. Play the recorded video. A PDF of the deck should already be on the laptop. See [prep-checklist.md](prep-checklist.md).
