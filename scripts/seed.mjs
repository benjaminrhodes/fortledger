import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256File } from '../lib/hashing.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const dir = join(root, 'sample-data');
const files = [
  ['DOC-TITLE-001','title','1','title_commitment_v1.txt',true],
  ['DOC-SURVEY-001','survey','1','alta_survey_v1.txt',true],
  ['DOC-ZONING-001','zoning','1','zoning_letter_v1.txt',true],
  ['DOC-ENV-001-V1','environmental','1','phase_i_esa_v1.txt',false],
  ['DOC-ENV-001-V2','environmental','2','phase_i_esa_v2.txt',true],
  ['DOC-LEASE-001','lease','1','tenant_lease_v1.txt',true],
  ['DOC-RENT-001','rent_roll','1','rent_roll_2026_09.txt',true],
  ['DOC-OPEX-001','operating_costs','1','operating_costs_2026_09.txt',true]
];
const documents = [];
for (const [documentId, category, version, filename, current] of files) {
  const sourcePath = `sample-data/documents/${filename}`;
  documents.push({ documentId, category, version, sourcePath, sha256: await sha256File(join(root, sourcePath)), current, reviewStatus: 'human_verified' });
}
await mkdir(dir, { recursive: true });
await writeFile(join(dir, 'documents.json'), JSON.stringify(documents, null, 2) + '\n');
console.log(`Seeded ${documents.length} source-backed document versions across 7 categories.`);
