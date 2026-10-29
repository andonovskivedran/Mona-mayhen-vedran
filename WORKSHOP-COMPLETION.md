# Mona Mayhem: CLI workshop completion

## Implementation plan

Keep Astro's server output and standalone Node adapter. Proxy GitHub `.contribs` data through `/api/contributions/[username]` to avoid browser CORS restrictions. Validate usernames and the complete upstream calendar, enforce a 10-second timeout, cache successful responses for 15 minutes, and cap the in-memory cache at 500 users. Never cache error responses.

Fetch both players in parallel. Render safe DOM nodes rather than injecting profile strings into HTML. Keep shared calendar validation and battle calculations separate from browser events. Use global application CSS so dynamically created graph cells receive the same styling as the page.

## Completed features

- Parts 1–2: repository instructions, project architecture, development setup, server API and page scaffold.
- Part 3: parallel requests, GitHub calendar grids, contribution totals/date ranges, form validation, Enter submission, loading and upstream errors.
- Part 4: navy/green/purple arcade identity, Google Fonts, CRT scanlines, neon title, VS gradient, shimmer, entrance motion, hover glows and reduced-motion support.
- Part 5: single-column comparison at 1024px; stacked inputs and smaller typography at 768px; visible keyboard focus, error styling and shake; parallel API review and schema hardening.
- Part 6: winner/tie banner, longest streak and leader label, last ten battles with local storage and clear/replay controls, synthesized arcade sounds and mute, countdown reveal, real API color legend, clipboard sharing with manual fallback.
- Optional theme variation: switch between classic green/purple and electric cyan/orange.

## Run and verify

```sh
npm ci
npm test
npm run check
npm run build
npm run preview
```

Use `octocat` and `torvalds` for a live matchup. Also test empty/invalid usernames, Enter submission, mobile layouts, calendar hover/tap and keyboard arrows, sound/theme controls, persisted history and clipboard sharing.

The workshop's Copilot slash commands are interactive learning exercises; this implementation was completed with Codex. It does not claim to have run Copilot `/login`, `/fleet`, `/delegate` or `/review` sessions. The existing GitHub Pages workflow publishes the static workshop, while this application requires a Node server (`HOST=0.0.0.0 PORT=4321 node dist/server/entry.mjs`).

## Verified results

- All 11 API and battle-logic tests pass.
- Astro/TypeScript check: zero errors, warnings or hints.
- Production build succeeds.
- Built Node server serves the page and bundled CSS/JavaScript with HTTP 200.
- Built API returns valid live calendars for `octocat` and `torvalds`, and HTTP 400 for an invalid username.
- Interactive visual browser QA was blocked by Computer Use being unable to determine Chrome's URL; it is not claimed as verified.
- GitHub Actions runs the type check, tests and production build on pushes and pull requests.
