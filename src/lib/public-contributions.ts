import { FALLBACK_COLORS, isContributionData, USERNAME_PATTERN, type ContributionData, type ContributionWeek } from './contributions.ts';

export function publicContributionUrl(username: string): string {
  if (!USERNAME_PATTERN.test(username)) throw new Error('Invalid GitHub username.');
  return `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`;
}

/** Adapt the public, CORS-enabled API to the same calendar used by the Node app. */
export function normalizePublicContributions(value: unknown): ContributionData {
  if (!value || typeof value !== 'object' || !('contributions' in value) || !Array.isArray(value.contributions) || value.contributions.length === 0 || value.contributions.length > 380) {
    throw new Error('The contribution service returned an invalid calendar. Please try again.');
  }
  const weeks = new Map<string, ContributionWeek>();
  let total = 0;
  let previous = '';
  const dates: string[] = [];
  for (const day of value.contributions) {
    if (!day || typeof day !== 'object' || typeof day.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day.date)
      || day.date <= previous || !Number.isSafeInteger(day.count) || day.count < 0 || !Number.isInteger(day.level) || day.level < 0 || day.level > 4) {
      throw new Error('The contribution service returned an invalid calendar. Please try again.');
    }
    const date = new Date(`${day.date}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== day.date) throw new Error('The contribution service returned an invalid date.');
    const weekday = date.getUTCDay();
    date.setUTCDate(date.getUTCDate() - weekday);
    const first_day = date.toISOString().slice(0, 10);
    if (!weeks.has(first_day)) weeks.set(first_day, { first_day, contribution_days: [] });
    weeks.get(first_day)!.contribution_days.push({ weekday, count: day.count, level: day.level });
    total += day.count; previous = day.date; dates.push(day.date);
  }
  const data: ContributionData = { from: dates[0], to: dates[dates.length - 1], total_contributions: total, colors_full: FALLBACK_COLORS, weeks: [...weeks.values()] };
  if (!isContributionData(data)) throw new Error('The contribution service returned an invalid calendar. Please try again.');
  return data;
}
