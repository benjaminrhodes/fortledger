# Data Model

- `asset`: `assetId`, `recordVersion`, `name`, `propertyType`, `locationLabel`, `synthetic`, `dataStatus`, `industrialFit`, `facts`.
- `industrialFit`: `power`, `clearHeight`, `docks`, `floorLoad`, `transportAccess`. Each field is `cited` with a citation, or `not_found` with `value: null` and `citation: null`.
- `citation`: `documentId`, `version`, `location`, `excerpt`, `sourcePath`. A cited excerpt is an exact line of the source file.
- `catalog` entry: `documentId`, `category`, `version`, `filename`, `current`, `reviewStatus`, and an optional `reportDate`. This is the review-status input. `scripts/seed.mjs` refuses a missing `reviewStatus` and does not invent `human_verified`.
- `asset.asOf` is the synthetic as-of date. An environmental `reportDate` more than 180 days earlier is flagged `stale` under ASTM E1527-21 §4.6. The hash status is unchanged.
- `documentVersion`: the seed output. `documentId`, `category`, `version`, `sourcePath`, `sha256`, `current`, `reviewStatus`.
- `manifest`: `schemaVersion`, `assetId`, `recordVersion`, and the sorted approved document commitments. The manifest hash is SHA-256 of the canonical JSON of that object.

Only records with `current: true` and `reviewStatus: "human_verified"` enter the approved manifest. Superseded versions stay in the catalog for comparison. A missing approved source, a missing anchored manifest when a newer version needs one, or an unavailable chain read returns `unable_to_verify`, never `verified`.

Everything in `sample-data/` is synthetic demonstration data.
