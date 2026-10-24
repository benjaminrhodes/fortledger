import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { repoRoot } from '../lib/paths.mjs';

test('industrial-fit fields and facts cite an exact source line or are not_found', async () => {
  const asset = JSON.parse(await readFile(join(repoRoot, 'sample-data/asset-profile.json'), 'utf8'));
  assert.equal(asset.synthetic, true);
  assert.match(asset.dataStatus, /synthetic/i);
  assert.deepEqual(Object.keys(asset.industrialFit), ['power', 'clearHeight', 'docks', 'floorLoad', 'transportAccess']);

  const cited = [];
  const missing = [];
  for (const [key, field] of Object.entries(asset.industrialFit)) {
    if (field.status === 'not_found') missing.push(key);
    else cited.push(field);
  }
  for (const fact of asset.facts) {
    if (fact.status === 'not_found') missing.push(fact.id);
    else cited.push(fact);
  }

  assert.deepEqual(missing, ['floorLoad']);
  assert.equal(asset.industrialFit.floorLoad.value, null);
  assert.equal(asset.industrialFit.floorLoad.citation, null);

  for (const field of cited) {
    assert.equal(field.status, 'cited');
    assert.match(String(field.value), /fictional/i);
    const citation = field.citation;
    assert.ok(citation.documentId);
    assert.ok(citation.version);
    assert.ok(citation.location);
    assert.ok(citation.excerpt);
    assert.ok(citation.excerpt.includes(field.value));
    const text = await readFile(join(repoRoot, citation.sourcePath), 'utf8');
    assert.ok(text.split(/\r?\n/).includes(citation.excerpt));
    assert.match(text, /SYNTHETIC/);
  }
});
