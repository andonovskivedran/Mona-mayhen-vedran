import { USERNAME_PATTERN, type ContributionData } from './contributions.ts';
export { USERNAME_PATTERN, FALLBACK_COLORS, type ContributionDay, type ContributionData } from './contributions.ts';
export interface BattleRecord {
  players: [string, string]; totals: [number, number]; winner: string | null; timestamp: number;
}

export function contributionDays(data: ContributionData) {
  return data.weeks.flatMap(week => week.contribution_days.map(day => {
    const date = new Date(`${week.first_day}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + day.weekday);
    return { ...day, date: date.toISOString().slice(0, 10) };
  })).filter(day => day.date >= data.from && day.date <= data.to).sort((a, b) => a.date.localeCompare(b.date));
}

export function longestStreak(data: ContributionData): number {
  let longest = 0, current = 0, previous = 0;
  for (const day of contributionDays(data)) {
    const time = Date.parse(day.date);
    current = day.count > 0 ? (time - previous === 86_400_000 ? current + 1 : 1) : 0;
    longest = Math.max(longest, current);
    previous = time;
  }
  return longest;
}

export function winnerOf(players: [string, string], totals: [number, number]): string | null {
  return totals[0] === totals[1] ? null : players[totals[0] > totals[1] ? 0 : 1];
}

export function readHistory(raw: string | null): BattleRecord[] {
  try {
    const items: unknown = JSON.parse(raw ?? '[]');
    if (!Array.isArray(items)) return [];
    return items.filter((item): item is BattleRecord => Boolean(item && typeof item === 'object'
      && Array.isArray(item.players) && item.players.length === 2 && item.players.every((p: unknown) => typeof p === 'string' && USERNAME_PATTERN.test(p))
      && Array.isArray(item.totals) && item.totals.length === 2 && item.totals.every((n: unknown) => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0)
      && (item.winner === null || item.players.includes(item.winner))
      && typeof item.timestamp === 'number' && item.timestamp >= 0 && item.timestamp <= 8.64e15)).slice(0, 10);
  } catch { return []; }
}

export function shareText(record: BattleRecord): string {
  return `MONA MAYHEM ⚡ ${record.players[0]} (${record.totals[0].toLocaleString()}) vs ${record.players[1]} (${record.totals[1].toLocaleString()}) — ${record.winner ? `${record.winner} WINS! 🏆` : "IT'S A TIE! 🤝"}`;
}
