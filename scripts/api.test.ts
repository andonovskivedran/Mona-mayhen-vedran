import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { isContributionData } from '../src/lib/contributions.ts';
import { GET } from '../src/pages/api/contributions/[username].ts';

const originalFetch = globalThis.fetch;
after(() => { globalThis.fetch = originalFetch; });

function calendar() {
	return {
		from: '2026-10-25', to: '2026-10-29', total_contributions: 12,
		colors_full: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
		weeks: [{ first_day: '2026-10-25', contribution_days: [
			{ weekday: 0, count: 0, level: 0 },
			{ weekday: 1, count: 12, level: 4 },
			{ weekday: 2, count: 0, level: 0 },
			{ weekday: 3, count: 0, level: 0 },
			{ weekday: 4, count: 0, level: 0 },
		] }],
	};
}

async function get(username: string) {
	return await GET({ params: { username } } as never) as Response;
}

test('calendar schema accepts partial weeks and rejects corrupt dates, values and order', () => {
	assert.equal(isContributionData(calendar()), true);
	const wrongDate = calendar();
	wrongDate.from = '2026-02-31';
	assert.equal(isContributionData(wrongDate), false);
	const wrongCount = calendar();
	wrongCount.weeks[0].contribution_days[0].count = -1;
	assert.equal(isContributionData(wrongCount), false);
	const wrongLevel = calendar();
	wrongLevel.weeks[0].contribution_days[0].level = 5;
	assert.equal(isContributionData(wrongLevel), false);
	const duplicate = calendar();
	duplicate.weeks[0].contribution_days[1].weekday = 0;
	assert.equal(isContributionData(duplicate), false);
	const wrongPalette = calendar();
	wrongPalette.colors_full[0] = 'url(javascript:alert(1))';
	assert.equal(isContributionData(wrongPalette), false);
	assert.equal(isContributionData({ ...calendar(), weeks: [{}] }), false);
});

test('invalid usernames fail locally before an upstream request', async () => {
	globalThis.fetch = async () => { throw new Error('Must not call GitHub'); };
	for (const name of ['', '-invalid', 'invalid-', 'two--hyphens', 'a/b', 'a'.repeat(40)]) {
		const response = await get(name);
		assert.equal(response.status, 400, name);
		assert.equal(response.headers.get('cache-control'), 'no-store');
	}
});

test('successful data is cached with case-insensitive username keys', async () => {
	let calls = 0;
	globalThis.fetch = async (url) => {
		calls++;
		assert.equal(url, 'https://github.com/Cache-User.contribs');
		return Response.json(calendar());
	};
	const first = await get('Cache-User');
	assert.equal(first.status, 200);
	assert.deepEqual(await first.json(), calendar());
	const second = await get('cache-user');
	assert.equal(second.status, 200);
	assert.deepEqual(await second.json(), calendar());
	assert.equal(calls, 1);
});

test('not found and GitHub rate limits produce actionable errors', async () => {
	for (const [upstreamStatus, expected] of [[404, 404], [429, 503], [403, 503], [500, 502]]) {
		globalThis.fetch = async () => new Response('', { status: upstreamStatus });
		const response = await get(`status-${upstreamStatus}`);
		assert.equal(response.status, expected);
		assert.equal(typeof (await response.json()).error, 'string');
	}
});

test('malformed payloads are rejected and never cached', async () => {
	let calls = 0;
	globalThis.fetch = async () => {
		calls++;
		return calls === 1 ? Response.json({ weeks: [] }) : Response.json(calendar());
	};
	assert.equal((await get('corrupt-payload')).status, 502);
	assert.equal((await get('corrupt-payload')).status, 200);
	assert.equal(calls, 2);
	globalThis.fetch = async () => new Response('<html>not JSON</html>');
	assert.equal((await get('invalid-json')).status, 502);
});

test('network failures return JSON instead of leaking exceptions', async () => {
	globalThis.fetch = async () => { throw new TypeError('fetch failed'); };
	const response = await get('network-error');
	assert.equal(response.status, 502);
	assert.deepEqual(await response.json(), { error: 'Unable to reach GitHub.' });
});

test('slow GitHub requests abort and return a retryable timeout', async (context) => {
	context.mock.timers.enable({ apis: ['setTimeout'] });
	globalThis.fetch = async (_url, options) => new Promise((_resolve, reject) => {
		options?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
	});
	const pending = get('timeout-user');
	context.mock.timers.tick(10_001);
	const response = await pending;
	assert.equal(response.status, 504);
	assert.deepEqual(await response.json(), { error: 'GitHub contribution request timed out.' });
});
