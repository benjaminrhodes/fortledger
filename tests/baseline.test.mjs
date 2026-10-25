import test from 'node:test';
import assert from 'node:assert/strict';
import { publishedBaseline } from '../lib/baseline.mjs';
import { phaseIViability } from '../lib/viability.mjs';

test('published diligence ranges are cited and not claimed as our measurement', () => {
  assert.equal(publishedBaseline.measuredByFortLedger, false);
  assert.equal(publishedBaseline.manualDiligence, null);
  assert.match(publishedBaseline.label, /not measured by FortLedger/i);
  const topics = publishedBaseline.ranges.map((item) => item.topic);
  assert.deepEqual(topics, [
    'Texas commercial due-diligence period',
    'Phase I ESA turnaround',
    'Phase I viability',
    'ALTA/NSPS land title survey',
    'Manual lease review'
  ]);
  for (const item of publishedBaseline.ranges) {
    assert.ok(item.range);
    assert.ok(item.citations.every((citation) => citation.name && citation.url.startsWith('https://')));
  }
  assert.match(publishedBaseline.ranges[0].range, /30–60 days/);
  assert.match(publishedBaseline.ranges[0].range, /60–90 days/);
  assert.match(publishedBaseline.ranges[2].range, /180 days/);
  assert.match(publishedBaseline.ranges[4].range, /3–4 analyst-hours/);
});

test('Phase I viability flips on the 181st day', () => {
  assert.equal(phaseIViability('2026-04-27', '2026-10-24').status, 'viable');
  assert.equal(phaseIViability('2026-04-27', '2026-10-24').ageDays, 180);
  assert.equal(phaseIViability('2026-04-26', '2026-10-24').status, 'stale');
  assert.equal(phaseIViability('2026-04-26', '2026-10-24').ageDays, 181);
});
