import test from 'node:test';
import assert from 'node:assert/strict';
import { longestStreak, readHistory, winnerOf, shareText, contributionDays, type ContributionData } from '../src/lib/battle.ts';

const calendar: ContributionData = {
  from: '2026-01-01', to: '2026-01-10', total_contributions: 16, colors_full: [],
  weeks: [
    {first_day:'2025-12-28',contribution_days:[{weekday:3,count:10,level:4},{weekday:4,count:1,level:1},{weekday:5,count:1,level:1},{weekday:6,count:1,level:1}]},
    {first_day:'2026-01-04',contribution_days:[{weekday:0,count:2,level:2},{weekday:1,count:0,level:0},{weekday:2,count:1,level:1},{weekday:4,count:1,level:1}]}
  ]
};
test('streak crosses weeks/year boundaries and excludes days outside displayed period', () => {
  assert.equal(longestStreak(calendar),4);
  assert.equal(contributionDays(calendar)[0].date,'2026-01-01');
});
test('missing days break a streak and zero-contribution days reset it', () => {
  const data = structuredClone(calendar); data.weeks[0].contribution_days=[];
  assert.equal(longestStreak(data),1);
  data.weeks=[]; assert.equal(longestStreak(data),0);
});
test('winner covers both players and tie', () => {
  assert.equal(winnerOf(['one','two'],[4,3]),'one');
  assert.equal(winnerOf(['one','two'],[3,4]),'two');
  assert.equal(winnerOf(['one','two'],[4,4]),null);
});
test('history is bounded and handles corrupted or untrusted saved data', () => {
  assert.deepEqual(readHistory('{bad'),[]);
  assert.deepEqual(readHistory('{}'),[]);
  const record = {players:['one','two'],totals:[4,3],winner:'one',timestamp:Date.now()};
  assert.equal(readHistory(JSON.stringify(Array(20).fill(record))).length,10);
  assert.equal(readHistory(JSON.stringify([{...record,timestamp:1e20},{...record,players:['<script>','two']},{...record,totals:[-1,3]},record])).length,1);
  assert.match(shareText(record as any),/one WINS/);
});
