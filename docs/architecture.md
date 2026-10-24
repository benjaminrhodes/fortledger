# Architecture

FortLedger has three trust boundaries:

1. **Off-chain source layer.** Synthetic files in `sample-data/documents/` stay on the machine running the demo. Their bytes are what verification hashes.
2. **Application layer.** `sample-data/catalog.json` supplies document identity and `reviewStatus`. `sample-data/asset-profile.json` supplies cited facts and industrial-fit fields. The operator page at `npm run dev` fails closed when a source file or the chain cannot be read.
3. **Chain anchor.** A local Hardhat node runs `contracts/AssetRecordToken.sol`. The token stores asset id, record version, manifest URI, and manifest hash. It does not store source documents.

Flow: source files → SHA-256 per file → approved manifest (`current` and `human_verified`) → manifest hash → issuer mint → `eth_call` the token and hash the files again → `verified`, `outdated`, `failed`, or `unable_to_verify`.

`npm run dev` is the whole path: compile, start Hardhat, anchor, serve the page on http://127.0.0.1:4173. `sample-data/anchor.json` is written at runtime so the reader knows the contract address and token id. The expected hash still comes from the contract. If the RPC port is closed, verification returns `unable_to_verify`.
