# Token Model and Limitations

`contracts/AssetRecordToken.sol` is an ERC-721-style proof object for one digital record manifest. The chain stores asset id, record version, manifest URI, and manifest hash. `LEGAL_TITLE` and `INVESTMENT_RIGHTS` are constants set to false, and `getRecord` returns those flags plus `transferPolicy: "disabled"`.

The authorized issuer can mint. Any other account’s mint reverts with `UnauthorizedIssuer`. `transferFrom`, both `safeTransferFrom` overloads, `approve`, and `setApprovalForAll` revert with `TransfersDisabled`. The contract reports the ERC-721 and ERC-721 metadata interface ids, then refuses every transfer. It is a record token, not a transferable collectible, and it does not change a county land record or create equity, debt, rent, or investment rights.

`test-contracts/AssetRecordToken.cjs` covers authorized mint, rejected unauthorized mint, and rejected transfers.

Limitations: synthetic data; local Hardhat only; no legal authority; seeded extraction; no arbitrary OCR; no production access control beyond the issuer check; no live county, lease, tenant, accounting, or environmental integrations. Hardhat’s default accounts are public demo keys. Do not fund them.
