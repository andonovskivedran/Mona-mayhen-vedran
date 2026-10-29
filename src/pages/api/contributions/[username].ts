import type { APIRoute } from 'astro';
import { isContributionData, USERNAME_PATTERN } from '../../../lib/contributions.ts';

export const prerender = false;

const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_CACHE_ENTRIES = 500;
const UPSTREAM_TIMEOUT_MS = 10_000;

const responseCache = new Map<string, { body: string; expiresAt: number }>();

function jsonError(message: string, status: number): Response {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'no-store',
		},
	});
}

function pruneCache(now: number): void {
	for (const [username, entry] of responseCache) {
		if (entry.expiresAt <= now) {
			responseCache.delete(username);
		}
	}

	while (responseCache.size >= MAX_CACHE_ENTRIES) {
		const oldestUsername = responseCache.keys().next().value;
		if (oldestUsername === undefined) {
			break;
		}
		responseCache.delete(oldestUsername);
	}
}

export const GET: APIRoute = async ({ params }) => {
	const username = params.username;
	if (!username || !USERNAME_PATTERN.test(username)) {
		return jsonError('Invalid GitHub username.', 400);
	}

	const cacheKey = username.toLowerCase();
	const now = Date.now();
	const cached = responseCache.get(cacheKey);
	if (cached && cached.expiresAt > now) {
		return new Response(cached.body, {
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
		});
	}
	if (cached) {
		responseCache.delete(cacheKey);
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

	try {
		const upstream = await fetch(`https://github.com/${encodeURIComponent(username)}.contribs`, {
			signal: controller.signal,
			headers: { Accept: 'application/json' },
		});

		if (upstream.status === 404) {
			return jsonError('GitHub user not found.', 404);
		}
		if (upstream.status === 429 || upstream.status === 403) {
			return jsonError('GitHub is limiting requests. Please try again in a few minutes.', 503);
		}
		if (!upstream.ok) {
			return jsonError('Unable to fetch GitHub contribution data.', 502);
		}

		const body = await upstream.text();
		try {
			if (!isContributionData(JSON.parse(body))) {
				return jsonError('GitHub returned an invalid contribution response.', 502);
			}
		} catch {
			return jsonError('GitHub returned an invalid contribution response.', 502);
		}

		pruneCache(Date.now());
		responseCache.delete(cacheKey);
		responseCache.set(cacheKey, { body, expiresAt: Date.now() + CACHE_TTL_MS });

		return new Response(body, {
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
		});
	} catch {
		return controller.signal.aborted
			? jsonError('GitHub contribution request timed out.', 504)
			: jsonError('Unable to reach GitHub.', 502);
	} finally {
		clearTimeout(timeout);
	}
};
