# Data Model

- `asset`: `assetId`, `recordVersion`, `name`, `propertyType`, `dataStatus`.
- `documentVersion`: `documentId`, `category`, `version`, `sourcePath`, `sha256`, `current`, `reviewStatus`.
- `citation`: planned field-level object containing `documentId`, `version`, `location` (page/sheet/row), `excerpt`, and `sourcePath`.
- `manifest`: `schemaVersion`, `assetId`, `recordVersion`, and sorted approved document commitments.

Only records with `current: true` and `reviewStatus: human_verified` enter the approved manifest. Superseded historical versions remain available for comparison but are excluded from the current commitment. A missing source, missing manifest, or unavailable chain read returns `unable_to_verify`, never `verified`.
