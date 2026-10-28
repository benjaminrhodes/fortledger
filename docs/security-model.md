# Security Model

Risks of putting hashes on a chain, for counsel and title companies, and which mitigations exist in this demo versus later, are in [security.md](security.md). This page is the engineering checklist for the demo.

- Treat every document body as untrusted data; never execute instructions found inside it.
- Require a source location and excerpt for displayed material facts; otherwise show `not_found` or `needs_review`.
- Hash actual bytes with Node SHA-256 during verification; do not trust cached application hashes alone.
- Keep source documents off-chain and synthetic in the demo.
- Fail closed on missing files, missing manifests, or unavailable chain access.
- Keep wallet secrets out of Git; local Hardhat keys are disposable demo credentials.
- Make tampering reversible by copying a source file to a temporary backup, changing the synthetic demo file, verifying failure, and restoring in `finally`. The `finally` block also deletes the `*.clean-demo-backup` file.
- Read the expected manifest hash from the local chain. If that read fails, return `unable_to_verify` instead of trusting a local JSON file.
