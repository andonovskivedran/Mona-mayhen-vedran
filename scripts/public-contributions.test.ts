import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePublicContributions, publicContributionUrl } from '../src/lib/public-contributions.ts';
import { longestStreak } from '../src/lib/battle.ts';

test('public API calendar retains dates, aligns weekdays and computes totals across weeks', () => {
  const data = normalizePublicContributions({ contributions: [
    { date:'2026-01-03',count:2,level:1 }, { date:'2026-01-04',count:3,level:2 }, { date:'2026-01-05',count:0,level:0 },
  ] });
  assert.equal(data.from,'2026-01-03'); assert.equal(data.to,'2026-01-05');
  assert.equal(data.total_contributions,5);
  assert.equal(data.weeks[0].first_day,'2025-12-28');
  assert.equal(data.weeks[0].contribution_days[0].weekday,6);
  assert.equal(data.weeks[1].contribution_days[0].weekday,0);
  assert.equal(longestStreak(data),2);
});
test('public API adapter rejects malformed, unordered and duplicate dates', () => {
  for (const payload of [null, {}, {contributions:[]}, {contributions:[{date:'2026-02-30',count:1,level:1}]},
    {contributions:[{date:'2026-01-01',count:-1,level:1}]},
    {contributions:[{date:'2026-01-01',count:1,level:5}]},
    {contributions:Array(2).fill({date:'2026-01-01',count:1,level:1})}]) assert.throws(() => normalizePublicContributions(payload));
});
test('public API URL validates usernames before making requests', () => {
  assert.equal(publicContributionUrl('octocat'),'https://github-contributions-api.jogruber.de/v4/octocat?y=last');
  assert.throws(() => publicContributionUrl('../bad')); assert.throws(() => publicContributionUrl('bad--name'));
});
