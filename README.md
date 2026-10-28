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
- `turbo migrate` run migrations
- `turbo migrate:generate -- --name <name>` create migration
- `turbo migrate:status` show migration status
- `turbo migrate:undo` rollback last migration
- `turbo clean` clean caches, generated files, and `.env`
- `turbo topo --graph=graph.html` monorepo dependency graph

### Dev workflow

`turbo dev` runs these steps in order before starting the Next.js dev server:

1. `**dg#env**` - Generates `.env` from 1Password (vault `dg`) using `@dg/cli env generate`
2. `**migrate**` - Runs database migrations via `@dg/db` (Sequelize)
3. `**dev**` - Starts the persistent Next.js dev server, watching all app and package files

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

`.env` is generated from 1Password (vault `dg`) using `[config/env.secrets.keys](config/env.secrets.keys)`. Each key must be an item with the same name and the value stored in the `value` field. To regenerate after vault changes: `turbo clean && turbo dev` or delete `.env` and re-run `turbo dev`.

OAuth and webhook debugging lives at `/dev-console`. In production, **Sign in with Vercel** on `/dev-console` authenticates the site owner via a signed HttpOnly session cookie (local `turbo dev` unlocks `/dev-console` automatically). Needs a Vercel App plus `NEXT_PUBLIC_VERCEL_APP_CLIENT_ID` / `VERCEL_APP_CLIENT_SECRET` in the project env and matching 1Password items before `turbo env`. How it works, dashboard setup, and security boundary: [`apps/web/src/auth/vercel/README.md`](apps/web/src/auth/vercel/README.md).

### Agent surfaces

Public discovery endpoints for LLMs and tools (route registry lives in `packages/shared-core/routes`):

- `/llms.txt` and `/llms-full.txt` — site summaries for agents
- `/.well-known/api-catalog`, `openapi.json`, `api-status` — machine-readable API discovery
- `/.well-known/agent-skills` — skill index + per-skill markdown
- WebMCP tools in `apps/web/src/app/layouts/WebMcpTools.tsx`

## :memo: Pull Requests

Feature branches squash onto main, and Linear is used for ticket tracking.

1. PR creation triggers CI checks and posts the target version preview comment (see Versioning below).
2. Use the Vercel deploy preview to verify functionality.
3. Merges automatically create a GitHub release with the "What changed?" content as notes 🎉

Required GitHub Permissions

The release workflow requires:

1. **Actions permissions** → Workflow permissions → **Read and write permissions**
2. **Actions permissions** → **Allow GitHub Actions to create and approve pull requests** (checked)

## :test_tube: Testing

- Unit tests live in `__tests__` folders next to source files and match basenames (`Homepage.tsx` → `__tests__/Homepage.test.tsx`).
- Run `turbo test --filter=@dg/web` for web unit tests.
- Jest setup is intentionally minimal (`apps/web/jest.setup.ts` only imports `@testing-library/jest-dom` and no-op popover methods for jsdom).
- Use `@testing-library/user-event` for interactions (avoid `fireEvent`).
- CI runs `turbo test` via the `🧪 Test` job.

## :rainbow: Architecture

Pretty standard Next.js App Router app. `/public` has static files, `/src/app` has pages and API
routes and components, `/src/types` has global types, `/src/hooks` has shared hooks, and
`/src/services` has server-side data fetching.

### Integrations

- [Next.js](https://nextjs.org/docs/getting-started) App Router provides routing, Server Components, and API routes. Client calls to `/api/X` hit `app/api/X/route.ts` on the server.
- [Vercel](https://vercel.com) hosts + builds the site. Every `main` commit deploys :tada: Env vars mirror `.env` generated from 1Password.
- [Cloudflare](https://cloudflare.com) manages DNS/security. Cloudflare's MX records redirect email to Gmail.
- [Contentful](https://www.contentful.com) supplies most content via GraphQL. New content triggers builds via webhook.
- Next.js App Router caching with Cache Components (`use cache`) and tag-based revalidation keeps data fresh.
- [Pigeon Maps](https://pigeon-maps.js.org/) powers the homepage location map and `/activities` route atlas (via [Stadia Maps](https://stadiamaps.com/)).
- `@dg/ui` provides shared zero-runtime UI primitives, theme tokens (`--dg-palette-*`, `--dg-shadow-*`), and global CSS rules (`getGlobalThemeCss`).
- Contentful schema lives in `packages/content-models/contentful/schema.graphql` and is refreshed via `turbo graphql:schema` for editor tooling. Responses are validated with Valibot.
- [Neon](https://neon.tech) is the Postgres DB for auth tokens, Strava activities, and Spotify history/favorites.
- [Sequelize](https://sequelize.org) runs migrations + shapes the DB.

### API

1. Server Components fetch data directly using server-only functions with Cache Components (`use cache`).
2. Data fetching uses tag-based revalidation for webhook-triggered updates.
3. Client Components receive data as props from Server Components.

### DB

Spotify + Strava use OAuth, so I use Neon + Sequelize to store and refresh tokens and persist synced activity and listening history.

Core tables include:

1. **Token** and **OauthState**: Store OAuth access/refresh tokens and PKCE state across Spotify and Strava.
2. **StravaActivity**: Persists webhook-synced Strava activities so routes read from Postgres instead of hitting Strava on page loads.
3. **SpotifyPlay**, **MusicAlbum**, **MusicArtist**, **MusicTrack**, **FavoriteAlbum**, and **FavoriteAlbumSnapshot**: Store incremental Spotify listening history, catalog metadata, and favorite album snapshots.

#### Spotify History

- Spotify only exposes the 50 most recent plays. Sync runs every 15 minutes via GitHub Actions calling `/api/spotify/sync`.
- An empty DB is seeded by the first cron sync from that recent-plays window; later runs fetch only plays after the latest stored timestamp.
- Historical gaps older than 50 plays can be backfilled from a Spotify Extended Streaming History `.zip` or `.json` export via `turbo spotify:import -- <path.zip | dir | file.json ...> [--dry-run] [--from=YYYY-MM-DD] [--to=YYYY-MM-DD]`.
- Track popularity is snapshotted per Pacific day whenever plays sync or import (Spotify's 0–100 score, Deezer rank only when Spotify has none). Plays from before snapshots began read a track's earliest snapshot, labeled as current popularity on `/music/stats`. Each history sync also scores a slice of never-scored tracks, backing off when Spotify refuses.
- Track metadata for history uses individual `GET /tracks/{id}` requests.
- The homepage "latest song" card uses `fetchRecentlyPlayed`, which returns now-playing or last-played data for UI.

#### Strava

DO NOT hit Strava directly unless you must. Webhooks persist activity data so we read from DB instead.

Each Strava app supports a single subscription, so I keep two apps: one for local testing, one for prod. `/api/webhooks` handles webhook events, and `/dev-console` handles OAuth setup and webhook subscription management.

Each app uses its own Neon database, tokens, and callback URLs. `OAUTH_CALLBACK_URL` should point at `/api/oauth` (shared by Strava and Spotify), and `STRAVA_WEBHOOK_CALLBACK_URL` should point at `/api/webhooks`.

Cloudflare Tunnels (`turbo tunnel`)

Run `turbo tunnel` alongside `turbo dev` when testing OAuth callbacks or webhooks locally.
This routes `https://dev.dylangattey.com` to your local Next.js server for OAuth and webhook testing.

To set up:

1. Get the tunnel token from [Cloudflare Zero Trust](https://one.dash.cloudflare.com/737867b500ec8ef1d7e5c9650e5dbfdb/networks/tunnels/cfd_tunnel/60e09136-a10f-499c-8925-bcef7570677d/edit?tab=overview)
2. Add it to 1Password as `CLOUDFLARE_TUNNEL_TOKEN`
3. Run `turbo env` to update your `.env`

The tunnel will fail if `CLOUDFLARE_TUNNEL_TOKEN` isn't configured in your `.env`.

#### Webhooks

1. Start `turbo dev` and `turbo tunnel`, then visit `/dev-console` in the browser to view webhook status and manage subscriptions. Delete subscriptions when done so Strava doesn't ping a dead endpoint.
2. Add a `console.log` in `apps/web/src/app/api/webhooks/route.ts` and rename an activity to trigger events. [Docs](https://developers.strava.com/docs/webhooks/)

### Versioning

Versioning derives each release version from the latest semver git tag and the PR template checkbox (`Major`, `Minor`, or `Patch`) without committing back to PR branches:

1. On open PRs, `.github/workflows/release.yml` (`📦 Bump version`) computes the target version from git tags and posts/updates the PR version preview comment without mutating `package.json`.
2. On merge to `main`, `🚀 Create release` computes the release version from the merged PR's checkbox and tags the squash merge commit with a GitHub Release (`vX.Y.Z`).
3. At build time (`apps/web/next.config.ts`), `resolveBuildVersion()` queries the repository's semver git tags (`git ls-remote --tags --refs`) and the commit's `# Release info` checkbox to inject `NEXT_PUBLIC_APP_VERSION` for `getAppVersionInfo()`.

[gh]: https://github.com/dgattey/dg
