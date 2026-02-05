[![GitHub version](https://flat.badgen.net/github/release/dgattey/dg?cache=600)][gh] [![Vercel](https://deploy-badge.vercel.app/vercel/?app=dg&style=flat-square)](https://vercel.com/dgattey/dg) [![Using Biome](https://img.shields.io/badge/using-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev) [![GitHub commits](https://flat.badgen.net/github/commits/dgattey/dg)][gh] [![Last commit](https://flat.badgen.net/github/last-commit/dgattey/dg/main)][gh]

# Dylan Gattey

Hi :wave: This is an overengineered way to show past projects / experiment with new tech. It's a lightweight, mobile-friendly React app in Typescript, powered by [Next](https://nextjs.org/docs/getting-started) and hosted on [Vercel](https://vercel.com). It's a monorepo using [pnpm](https://pnpm.io) workspaces and [Turbo](https://turbo.run).

## :hammer: Commands

- `turbo dev` start dev server (see [Dev workflow](#dev-workflow) below)
- `turbo build` prod build (CI)
- `turbo build:serve` prod build + serve (local testing)
- `turbo build:analyze` bundle size analysis
- `turbo check` Biome lint + format
- `turbo check:types` typecheck
- `turbo test` unit tests (Jest)
- `turbo graphql:schema` refresh Contentful GraphQL schema for editor tooling
- `turbo migrate` run migrations (`turbo db -- db:migrate:status`, `turbo db -- db:migrate:undo`)
- `turbo db -- migration:generate --name <name>` create migration
- `turbo webhook -- create <name>` create webhook (needs `dev`)
- `turbo webhook -- list <name>` list webhooks
- `turbo webhook -- delete <name> <id>` delete webhook
- `turbo clean` clean caches, generated files, and `.env`
- `turbo topo --graph=graph.html` monorepo dependency graph

### Dev workflow

`turbo dev` runs these steps in order before starting the Next.js dev server:

1. **`dg#env`** - Generates `.env` from 1Password (vault `dg`) using `scripts/generate-env`
3. **`migrate`** - Runs database migrations via `@dg/db` (Sequelize)
4. **`dev`** - Starts the persistent Next.js dev server, watching all app and package files

The dev and prod apps use separate Neon databases, so local testing won't affect production data.

## :beginner: Initial Setup

### Prereqs
- Homebrew
- 1Password account with vault `dg` (one item per env var; value stored in the `value` field)

Bootstrap uses `brew bundle` to install dependencies from the `Brewfile` (`nodenv`, `node-build`, `1password-cli`, `neonctl`, `cloudflared`) and installs `turbo` globally via `npm`.

### Setup
1. `scripts/bootstrap` (installs deps, authenticates 1Password + Turbo, generates `.env`)
2. `turbo dev` to start developing

If `turbo` is not found, ensure `~/.nodenv/shims` is on PATH, then `nodenv rehash`.

### Env Vars
`.env` is generated from 1Password (vault `dg`) using [`config/env.secrets.keys`](config/env.secrets.keys). Each key must be an item with the same name and the value stored in the `value` field. To regenerate after vault changes: `turbo clean && turbo dev` or delete `.env` and re-run `turbo dev`.

## :memo: Pull Requests

Feature branches squash onto main, and Linear is used for ticket tracking.

1. PR creation triggers CI checks and auto-bumps the version (see Versioning below).
1. Use the Vercel deploy preview to verify functionality.
1. Merges automatically create a GitHub release with the "What changed?" content as notes 🎉

<details>
<summary>Required GitHub Permissions</summary>

The release workflow requires:
1. **Actions permissions** → Workflow permissions → **Read and write permissions**
2. **Actions permissions** → **Allow GitHub Actions to create and approve pull requests** (checked)
</details>

## :test_tube: Testing

- Unit tests live in `__tests__` folders next to source files and match basenames (`Homepage.tsx` → `__tests__/Homepage.test.tsx`).
- Run `turbo test --filter=@dg/web` for web unit tests.
- Jest setup is intentionally minimal (`apps/web/jest.setup.ts` only imports `@testing-library/jest-dom` and no-op popover methods for jsdom).
- Use `@testing-library/user-event` for interactions (avoid `fireEvent`).
- CI runs `turbo test` via the `🧪 Test` job.

## :rainbow: Architecture

Pretty standard Next.js App Router app. `/public` has static files, `/src/app` has pages and API routes, `/src/types` has global types, `/src/hooks` has shared hooks, `/src/components` has React components, and `/src/services` has server-side data fetching.

### Integrations

- [Next.js](https://nextjs.org/docs/getting-started) App Router provides routing, Server Components, and API routes. Client calls to `/api/X` hit `app/api/X/route.ts` on the server.

- [Vercel](https://vercel.com) hosts + builds the site. Every `main` commit deploys :tada: Env vars mirror `.env` generated from 1Password.

- [Cloudflare](https://cloudflare.com) manages DNS/security. Cloudflare's MX records redirect email to Gmail.

- [Contentful](https://www.contentful.com) supplies most content via GraphQL. New content triggers builds via webhook.

- Next.js App Router caching with Cache Components (`use cache`) and tag-based revalidation keeps data fresh.

- [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/api/) powers the homepage map, lazy loaded on hover.

- [MUI](https://mui.com/material/) for UI and styling (`sx`, via `emotion`).

- Contentful schema lives in `packages/content-models/contentful/schema.graphql` and is refreshed via `pnpm graphql:schema` for editor tooling. Responses are validated with Valibot.

- [Neon](https://neon.tech) is the Postgres DB for auth tokens + more.

- [Sequelize](https://sequelize.org) runs migrations + shapes the DB.

### API

1. Server Components fetch data directly using server-only functions with Cache Components (`use cache`).
1. Data fetching uses tag-based revalidation for webhook-triggered updates.
1. Client Components receive data as props from Server Components.
1. `/src/api/server` is server-only (clients + fetchers). Don’t import it client-side.

### DB

Spotify + Strava use OAuth, so I use Neon + Sequelize to store and refresh tokens.

There are two tables:

1. **Token**: I grab the latest token, see if it's expired, and if so, fetch new data via Spotify/Strava + the saved refresh token. Once it’s persisted, I can call the APIs with the auth tokens. Nice defaults built in so anything missing gives back the right info as possible.
2. **StravaActivity**: I create a row on new activity webhooks, fetch the full activity from Strava, and re-fetch/update JSON when data changes. I track last update time so multiple updates in a window don’t hammer Strava’s servers.

To create and run a migration:

1. `turbo db -- migration:generate --name <name>` and add `up`/`down`
1. `turbo migrate` and merge branch when ready (undo: `turbo db -- db:migrate:undo`)

#### Strava

DO NOT hit Strava directly unless you must. Webhooks persist activity data so we read from DB instead.

Each Strava app supports a single subscription, so I keep two apps: one for local testing, one for prod. `/webhooks` handles both.

Both use the same DB but different tokens + callback URLs. `process.env.STRAVA_TOKEN_NAME` switches between them. For local webhook testing, use a Neon branch to avoid clobbering prod data.

<details>
<summary>Cloudflare Tunnels (automatic with turbo dev)</summary>

The tunnel starts automatically with `turbo dev` when `CLOUDFLARE_TUNNEL_TOKEN` is set.
This routes `https://dev.dylangattey.com` to your local Next.js server for OAuth and webhook testing.

To set up:
1. Get the tunnel token from [Cloudflare Zero Trust](https://one.dash.cloudflare.com/737867b500ec8ef1d7e5c9650e5dbfdb/networks/tunnels/cfd_tunnel/60e09136-a10f-499c-8925-bcef7570677d/edit?tab=overview)
2. Add it to 1Password as `CLOUDFLARE_TUNNEL_TOKEN`
3. Run `scripts/generate-env` to update your `.env`

The tunnel will fail if `CLOUDFLARE_TUNNEL_TOKEN` isn't configured in your `.env`.
</details>

#### Webhooks

1. Start `turbo dev`, then `turbo webhook -- create strava`. Delete it when done so Strava doesn’t ping a dead endpoint.
2. List: `turbo webhook -- list strava` | Delete: `turbo webhook -- delete strava <id>`
3. Add a `console.log` in `apps/web/src/app/api/webhooks/route.ts` and rename an activity to trigger events. [Docs](https://developers.strava.com/docs/webhooks/)
4. For prod testing, swap `STRAVA_*` items in 1Password to match Vercel (keep callback URL as dev), run `scripts/generate-env`, and restart so OAuth re-runs.

### Versioning

Versioning uses auto-generated version bumps on PRs with GitHub releases on merge. The version is stored in the root `package.json` and read directly by the app at build time. Check the appropriate checkbox in the PR template (Major/Minor/Patch) - the workflow will auto-commit the version bump to your branch and create a GitHub release on merge with notes from the "What changed?" section.

#### Version conflicts

If multiple PRs each have their own version bump and one merges, other PRs will have conflicts in `package.json`. To fix:

1. Run `scripts/drop-bot-commits` to remove bot-authored version bumps and rebase onto `origin/main`
2. Force push: `git push --force-with-lease`
3. The workflow will automatically create a fresh version bump commit

[gh]: https://github.com/dgattey/dg
