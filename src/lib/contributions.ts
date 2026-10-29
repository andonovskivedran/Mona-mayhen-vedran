export interface ContributionDay {
	weekday: number;
	count: number;
	level: number;
}

export interface ContributionWeek {
	first_day: string;
	contribution_days: ContributionDay[];
}

export interface ContributionData {
	from: string;
	to: string;
	total_contributions: number;
	colors_full: string[];
	weeks: ContributionWeek[];
}

export const USERNAME_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
export const FALLBACK_COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

function record(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function dateNumber(value: unknown): number | null {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
	const timestamp = Date.parse(`${value}T00:00:00Z`);
	return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value
		? timestamp
		: null;
}

function nonnegativeInteger(value: unknown): value is number {
	return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

/** Validate the upstream's complete calendar before using it in UI or cache. */
export function isContributionData(value: unknown): value is ContributionData {
	if (!record(value)) return false;
	const from = dateNumber(value.from);
	const to = dateNumber(value.to);
	if (
		from === null || to === null || from > to || to - from > 380 * 86_400_000 ||
		!nonnegativeInteger(value.total_contributions) ||
		!Array.isArray(value.colors_full) || value.colors_full.length !== 5 ||
		!value.colors_full.every(color => typeof color === 'string' && /^#[\da-f]{6}$/i.test(color)) ||
		!Array.isArray(value.weeks) || value.weeks.length === 0 || value.weeks.length > 55
	) return false;

	let previousDate = -Infinity;
	let previousWeek = -Infinity;
	for (const week of value.weeks) {
		if (!record(week)) return false;
		const firstDay = dateNumber(week.first_day);
		if (
			firstDay === null || firstDay <= previousWeek ||
			!Array.isArray(week.contribution_days) ||
			week.contribution_days.length === 0 || week.contribution_days.length > 7
		) return false;
		previousWeek = firstDay;
		let previousWeekday = -1;
		for (const day of week.contribution_days) {
			if (!record(day) || !nonnegativeInteger(day.weekday) || day.weekday > 6 ||
				day.weekday <= previousWeekday || !nonnegativeInteger(day.count) ||
				!nonnegativeInteger(day.level) || day.level > 4) return false;
			const date = firstDay + day.weekday * 86_400_000;
			if (date < from || date > to || date <= previousDate) return false;
			previousWeekday = day.weekday;
			previousDate = date;
		}
	}
	return true;
}
