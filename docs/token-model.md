# Token Model and Limitations

The Asset Record Token is an ERC-721-style proof object for one digital record manifest version. Metadata fields: asset ID, record version, manifest URI, manifest hash, record type, transfer policy, and explicit `legal_title: false` / `investment_rights: false` flags.

The demo contract will permit an authorized issuer to mint and will reject unauthorized minting and normal transfers. It will never claim to change a county land record, convey title, create equity, or grant debt/rent/investment rights. Private documents stay off-chain.

Limitations: synthetic data; local-chain-first; no legal authority; seeded extraction; no arbitrary OCR; no production access control; no live county, lease, tenant, accounting, or environmental integrations.
