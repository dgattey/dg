[![GitHub version](https://flat.badgen.net/github/release/dgattey/dg?cache=600)][gh] [![Vercel](https://deploy-badge.vercel.app/vercel/?app=dg&style=flat-square)](https://vercel.com/dgattey/dg) [![Using Biome](https://img.shields.io/badge/using-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev) [![GitHub commits](https://flat.badgen.net/github/commits/dgattey/dg)][gh] [![Last commit](https://flat.badgen.net/github/last-commit/dgattey/dg/main)][gh]

# Dylan Gattey

Hi :wave: This is an overengineered way to show past projects / experiment with new tech. It’s a lightweight, mobile-friendly React app in Typescript, powered by [Next](https://nextjs.org/docs/getting-started) and hosted on [Vercel](https://vercel.com). It’s a monorepo using [pnpm](https://pnpm.io) workspaces and [Turbo](https://turbo.run).

## :hammer: Commands

- `turbo dev` start dev server + prod DB connection (auto-generates `.env` if missing)
- `turbo build` prod build (CI)
- `turbo build:serve` prod build + serve (local testing)
- `turbo build:analyze` bundle size analysis
- `turbo check` Biome lint + format
- `turbo check:types` typecheck
- `turbo codegen` regenerate GraphQL + operation types
- `turbo db -- db:migrate` run migrations (`db:migrate:status`, `db:migrate:undo`)
- `turbo db -- migration:generate --name <name>` create migration
- `turbo webhook -- create <name>` create webhook (needs `dev`)
- `turbo webhook -- list <name>` list webhooks
- `turbo webhook -- delete <name> <id>` delete webhook
- `turbo release` version bump (GitHub Action)
- `turbo clean` clean caches, generated files, and `.env`
- `turbo topo --graph=graph.html` monorepo dependency graph

## :beginner: Initial Setup

### Prereqs
- Homebrew
- 1Password account with vault `dg` (one item per env var; value stored in the `value` field)

Bootstrap uses Homebrew to install `nodenv`, `node-build`, `1password-cli`, and `neonctl`, and installs `turbo` globally via `npm`.

### Setup
1. `scripts/bootstrap` (installs deps, authenticates 1Password + Turbo, generates `.env`)
2. `turbo dev` to start developing

If `turbo` is not found, ensure `~/.nodenv/shims` is on PATH, then `nodenv rehash`.

### Env Vars
`.env` is generated from 1Password (vault `dg`) using [`config/env.secrets.keys`](config/env.secrets.keys). Each key must be an item with the same name and the value stored in the `value` field. Non-secrets live in [`config/env.defaults`](config/env.defaults). To regenerate after vault changes: `turbo clean && turbo dev` or delete `.env` and re-run `turbo dev`.

## :memo: Pull Requests

Feature branches squash onto main, and Linear is used for ticket tracking.

1. PR creation will kick off Github actions for linting/formatting + post a comment about the new version.
1. Use the Vercel deploy preview to verify functionality.
1. Merges will automatically create a new version/release 🎉

## :rainbow: Architecture

Pretty standard Next app. `/public` has static files, `/src` has app code, `/src/types` has global types, `/src/hooks` has shared hooks, `/src/pages/api` has API routes, and `/src/api` has the shared API code.

### Integrations

- [Next](https://nextjs.org/docs/getting-started) wraps React and provides routing, SSR/SSG, and API routes. Client calls to `/api/X` hit `pages/api/X.tsx` on the server.

- [Vercel](https://vercel.com) hosts + builds the site. Every `main` commit deploys :tada: Env vars mirror `.env` generated from 1Password.

- [Cloudflare](https://cloudflare.com) manages DNS/security. Cloudflare's MX records redirect email to Gmail.

- [Contentful](https://www.contentful.com) supplies most content via GraphQL. New content triggers builds via webhook.

- Next.js App Router caching with Cache Components (`use cache`) and tag-based revalidation keeps data fresh.

- [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/api/) powers the homepage map, lazy loaded on hover.

- [MUI](https://mui.com/material/) for UI and styling (`sx`, via `emotion`).

- [GraphQL Codegen](https://www.graphql-code-generator.com) generates the `*.generated.ts` files from GitHub + Contentful schemas.

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

1. `turbo db -- migration:generate --name <name>`
1. Add `up`/`down`
1. Create a Neon branch
1. `turbo connect -- <branch>` + `turbo dev`
1. `turbo db -- db:migrate`
1. Merge Neon branch when ready
1. Undo: `turbo db -- db:migrate:undo`

#### Strava

DO NOT hit Strava directly unless you must. Webhooks persist activity data so we read from DB instead.

Each Strava app supports a single subscription, so I keep two apps: one for local testing, one for prod. `/webhooks` handles both.

Both use the same DB but different tokens + callback URLs. `process.env.STRAVA_TOKEN_NAME` switches between them. For local webhook testing, use a Neon branch to avoid clobbering prod data.

##### Cloudflare Tunnels

Local webhook testing uses Cloudflare Tunnel so `https://dev.dylangattey.com/api/webhooks` points at your local `turbo dev`.

1. Start the connector from the [tunnel config](https://one.dash.cloudflare.com/737867b500ec8ef1d7e5c9650e5dbfdb/networks/tunnels/cfd_tunnel/60e09136-a10f-499c-8925-bcef7570677d/edit?tab=overview) using the “Install and run a connector” section. Change it here if `api/webhooks` ever moves.
1. It runs as a persistent local service to keep the tunnel open.
1. For prod debugging, temporarily swap the `STRAVA_*` items in 1Password to prod values (except the callback URL), run `scripts/generate-env`, log into Strava, and change the accepted domain to the `dev` subdomain. Then delete + recreate the subscription and hit `api/webhooks` to restart the OAuth flow on dev.

#### Webhooks

Strava is the only webhook integration right now.

1. Start `turbo dev`, then `turbo webhook -- create strava`. Delete it when done so Strava doesn’t ping a dead endpoint.
2. To list existing subscriptions, run `turbo webhook -- list strava` to get the ids
3. To delete a subscription, run `turbo webhook -- delete strava <id>` with an id from the list script
4. Add a `console.log` in `pages/api/webhooks` and rename an activity to trigger events. Docs: https://developers.strava.com/docs/webhooks/.
5. To test prod, swap the `STRAVA_*` items in 1Password to match Vercel (leave the callback URL as dev), run `scripts/generate-env`, and restart everything so OAuth re-runs. Subscriptions are only changed locally with this script, or via curl, to prevent tampering.

### Versioning

Versioning uses `semantic-release` + Conventional Commits. I only bump major for big rewrites.

- **Major**: `!` in the subject
- **Minor**: `feat:`
- **Patch**: everything else

Test a dry run with `GITHUB_TOKEN=* turbo release -- --dry-run --branches={branch here}` after filling in the token, or done for you on all PRs.

[gh]: https://github.com/dgattey/dg