# Hashes on a chain: notes for counsel and title companies

Recording a hash is not the same as filing the document, and it is not free of risk. A law firm or a title company that put client files behind this pattern would be publishing a commitment that is hard to take back, and that commitment can sometimes be matched to a known file or to the timing of a deal.

This page separates **today** (this repository, local Hardhat, synthetic files) from **planned** (not built, not in the demo). Do not describe a planned control as something FortLedger already does.

## If asked “is it secure?”

“Hashes do not expose the documents, but they can leak timing and they can be guessed if a file is predictable. So we would salt every hash, record on a permissioned chain where only the title company or counsel can write, and keep names, addresses, and files off the chain. FortLedger proves a file has not changed. It does not replace legal review.”

The salt, the permissioned production chain, and those key controls are **planned**. The demo does not have them.

## Predictable files can be guessed

Someone who can guess the bytes of a document can hash the guess and compare it to a recorded hash. Standardized forms and short letters are the easy cases.

**Today.** Hashes are unsalted SHA-256 of the file bytes, and the manifest hash is unsalted SHA-256 of the canonical manifest JSON. There is no salt in this repo.

**Planned.** Salt every hash so a guess of the file alone does not match the chain.

## Timing of a deal can leak

The moment a hash is written shows that something was recorded. On a public chain, people who are not in the deal can see that clock. Batching and a chain that outsiders cannot read are the mitigations. Names and addresses do not belong on the chain either.

**Today.** The demo is a local Hardhat node on the operator’s machine, not a public network. There is no public mempool. The token still stores the asset id, the record version, the manifest hash, and a manifest URI (`local://sample-data/manifest-v1.json` in this demo). An anchor event carries the asset id, the version, and the hash. Document bodies are not stored. Party names and street addresses are not token fields. The sample asset id is `FL-TX-FW-0001`.

**Planned.** A permissioned chain, batching, and a rule that names, addresses, and files stay off the chain. People who are allowed onto that chain would still see timing. Batching narrows what a single write reveals. It does not make a write invisible to the participants.

## What is written cannot be erased

A chain does not forget a commitment because counsel wishes it had not been sent.

**Today.** Document bodies are not written. The on-chain fields are the asset id, record version, manifest hash, and manifest URI, and they are not salted. This demo’s chain state disappears when the Hardhat node stops. That is an artifact of a local demo, not an erasure feature anyone should rely on for client data.

**Planned.** Only salted hashes on the chain, with names, addresses, and files kept off it. Salt does not make the entry erasable. It makes the entry less useful to someone who does not already have the file and the salt.

## People will over-trust the word Verified

A green Verified on a closing checklist will be read as “this is true” unless the label says otherwise.

**Today.** The operator page says the data is a synthetic demonstration and not legal, title, or investment advice. The token reports `legal_title` false, `investment_rights` false, and transfers disabled. These docs state that Verified means unchanged since recorded, not proof the file is true. `reviewStatus: "human_verified"` is a value in `sample-data/catalog.json`. The software does not review the document.

**Planned.** The same plain label on any product screen, and a required human review before a result is used for closing or lender sign-off. The label text is not a substitute for that review.

## The wrong party can record first

Whoever writes the first commitment sets what later checks will call unchanged.

**Today.** Only the authorized issuer can mint. Any other mint reverts with `UnauthorizedIssuer`. The issuer in this demo is a public Hardhat account. Those keys are disposable demo credentials. Do not send real funds to them. There is no production access control beyond that issuer check.

**Planned.** Authorized recorders only, using signing keys the title company or counsel controls. The contract check is the piece that exists. The keys a firm would actually trust do not.

## Stolen keys

A stolen issuer key can anchor a manifest the firm did not approve.

**Today.** No hardware keys, no managed keys, no two-person approval, and no revocation. The demo keys are the default Hardhat accounts and are public.

**Planned.** Hardware or managed keys, two-person approval, and revocation.

## Client confidentiality

A hash of a client file is still derived from that file. Counsel needs a basis to compute it, and a place to put it that is not the public internet.

**Today.** The documents in this repo are synthetic. No client file is hashed. The chain is local to the demo machine. There is no consent step, because there is no client.

**Planned.** Client consent before a real file is hashed, and a private or permissioned chain by default.

## What this demo will not claim

- It will not claim the documents are true, complete, or current in a legal sense. Currency for a Phase I, in this demo, is a 180-day date flag (ASTM E1527-21 §4.6). That flag is separate from the hash.
- It will not claim title insurance, a survey, or a lawyer’s review can be skipped.
- It will not claim the planned controls above are already shipped.
