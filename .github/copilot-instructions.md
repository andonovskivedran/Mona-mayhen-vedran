# Mona Mayhem repository instructions

## Project layout and architecture

- This repository contains two related but separate deliverables:
  - The workshop website is static HTML/CSS/JavaScript in `docs/`, with workshop lesson sources in `workshop/`. `docs/step.html` loads lesson Markdown and uses `<!-- track:vscode:start/end -->` and `<!-- track:cli:start/end -->` markers to show track-specific instructions.
  - The Mona Mayhem application is an Astro server app in `src/`. `src/pages/index.astro` is its page, and `src/pages/api/contributions/[username].ts` is the username API route. `astro.config.mjs` configures server output with the standalone `@astrojs/node` adapter.
- GitHub Pages currently deploys only `docs/` and `workshop/` through `.github/workflows/deploy.yml`; it does not build or deploy the Astro app. Keep this distinction in mind when changing deployment behavior.

## Build and local commands

Run these from the repository root:

| Purpose | Command |
|---|---|
| Install dependencies | `npm ci` |
| Run the Astro app locally | `npm run dev` |
| Build the Astro app | `npm run build` |
| Preview the built Astro app | `npm run preview` |

`package.json` does not define test or lint scripts, and there is no configured test runner or single-test command.

## Content and localization conventions

- English workshop lessons in `workshop/` are the source content. Keep the VS Code and CLI variants in their existing track-marker blocks; `docs/step.html` depends on those markers.
- Localized content follows the existing locale directory names: `es`, `pt_BR`, and `ko`. The workshop lessons are in `workshop/<locale>/`; translated site pages are in `docs/<locale>/`; translated READMEs are `README.es.md`, `README.pt_BR.md`, and `README.ko.md`.
- `.github/workflows/localization-sync.yml` synchronizes changes to supported source files and maintains localization metadata in `localizations/<locale>/.localization-state.json`. Preserve this metadata and the existing source-to-locale path mapping when updating translations.
- The locale rules used by the synchronization workflow live in `.github/skills/localizations/rules/`. Preserve code, commands, URLs, markup, and machine-readable content when editing localized material.
