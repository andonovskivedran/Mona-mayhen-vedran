# Mona Mayhem repository instructions

## Project layout and architecture

- This repository contains two related but separate deliverables:
  - The workshop website is static HTML/CSS/JavaScript in `docs/`, with workshop lesson sources in `workshop/`. `docs/step.html` loads lesson Markdown and uses `<!-- track:vscode:start/end -->` and `<!-- track:cli:start/end -->` markers to show track-specific instructions.
  - The Mona Mayhem application is an Astro server app in `src/`. `src/pages/index.astro` is its page, and `src/pages/api/contributions/[username].ts` is the username API route. `astro.config.mjs` configures server output with the standalone `@astrojs/node` adapter.
- GitHub Pages deploys the battle arena using `astro.pages.config.mjs` and `pages-app/pages/index.astro`. The static build uses the CORS-enabled public contribution API; the normal Node build keeps its local API proxy. The workflow retains workshop pages under `/guide/`.

## Build and local commands

Run these from the repository root:

| Purpose | Command |
|---|---|
| Install dependencies | `npm ci` |
| Run the Astro app locally | `npm run dev` |
| Build the Astro app | `npm run build` |
| Preview the built Astro app | `npm run preview` |

Use Node.js 24+. Run `npm test` for API and battle-logic tests, `npm run check` for Astro/TypeScript diagnostics, and `npm run build` for production verification. Tests use the built-in Node test runner; run one with `node --test scripts/battle.test.ts`.

Shared contribution types and schema validation live in `src/lib/contributions.ts`; battle calculations are in `src/lib/battle.ts`. Browser interactions live in `src/scripts/battle.ts`. Global app styles are in `src/styles/arena.css` so dynamically created contribution cells receive their styles.

Run `npm run build:pages` to produce `dist-pages/` for GitHub Pages. Keep links and assets relative to `import.meta.env.BASE_URL`. `src/lib/public-contributions.ts` validates and converts the public API calendar into the shared response format. Never put GitHub tokens into browser code.

## Content and localization conventions

- English workshop lessons in `workshop/` are the source content. Keep the VS Code and CLI variants in their existing track-marker blocks; `docs/step.html` depends on those markers.
- Localized content follows the existing locale directory names: `es`, `pt_BR`, and `ko`. The workshop lessons are in `workshop/<locale>/`; translated site pages are in `docs/<locale>/`; translated READMEs are `README.es.md`, `README.pt_BR.md`, and `README.ko.md`.
- `.github/workflows/localization-sync.yml` synchronizes changes to supported source files and maintains localization metadata in `localizations/<locale>/.localization-state.json`. Preserve this metadata and the existing source-to-locale path mapping when updating translations.
- The locale rules used by the synchronization workflow live in `.github/skills/localizations/rules/`. Preserve code, commands, URLs, markup, and machine-readable content when editing localized material.

## Astro app visual direction

- Keep new app UI in the retro arcade style: near-black navy `#0a0a1a`, neon green `#5fed83`, and purple `#8a2be2`; use the Press Start 2P display font with a readable monospace body font.
- Favor subtle neon glows, CRT scanlines, and restrained motion over heavy decoration. Honor `prefers-reduced-motion` for animations and transitions.
- Keep the battle interface responsive and readable; preserve clear focus states, accessible status feedback, and contribution-grid labels when styling interactive components.
