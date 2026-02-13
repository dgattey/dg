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

## :memo: Pull Requests

Feature branches squash onto main, and Linear is used for ticket tracking.

1. PR creation triggers CI checks and auto-bumps the version (see Versioning below).
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
- [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/api/) powers the homepage map, lazy loaded on hover.
- [MUI](https://mui.com/material/) for UI and styling (`sx`, via `emotion`).
- Contentful schema lives in `packages/content-models/contentful/schema.graphql` and is refreshed via `turbo graphql:schema` for editor tooling. Responses are validated with Valibot.
- [Neon](https://neon.tech) is the Postgres DB for auth tokens + more.
- [Sequelize](https://sequelize.org) runs migrations + shapes the DB.

### API

1. Server Components fetch data directly using server-only functions with Cache Components (`use cache`).
2. Data fetching uses tag-based revalidation for webhook-triggered updates.
3. Client Components receive data as props from Server Components.

### DB

Spotify + Strava use OAuth, so I use Neon + Sequelize to store and refresh tokens.

There are two tables:

1. **Token**: I grab the latest token, see if it's expired, and if so, fetch new data via Spotify/Strava + the saved refresh token. Once it's persisted, I can call the APIs with the auth tokens. Nice defaults built in so anything missing gives back the right info as possible.
2. **StravaActivity**: I create a row on new activity webhooks, fetch the full activity from Strava, and re-fetch/update JSON when data changes. I track last update time so multiple updates in a window don't hammer Strava's servers.

#### Spotify History

- Spotify only exposes the 50 most recent plays. Sync runs every 30 minutes via GitHub Actions calling `/api/spotify/sync`.
- History sync is intentionally disabled until the GDPR import seeds the DB, to avoid gaps.
- Track metadata uses two separate Spotify API patterns:
  - **Imports** (GDPR data): Uses batch `GET /tracks?ids=` endpoint (deprecated by Spotify ~March 2026).
  - **Cron sync**: Uses individual `GET /tracks/{id}` endpoint for ongoing sync after batch access is removed.
- The homepage "latest song" card uses `fetchRecentlyPlayed`, which returns now-playing or last-played data for UI.

#### Strava

DO NOT hit Strava directly unless you must. Webhooks persist activity data so we read from DB instead.

Each Strava app supports a single subscription, so I keep two apps: one for local testing, one for prod. `/api/webhooks` handles webhook events, and `/console` handles OAuth setup and webhook subscription management (dev/test only).

Each app uses its own Neon database, tokens, and callback URLs. `OAUTH_CALLBACK_URL` should point at `/api/oauth` (shared by Strava and Spotify), and `STRAVA_WEBHOOK_CALLBACK_URL` should point at `/api/webhooks`.

Cloudflare Tunnels (automatic with turbo dev)

The tunnel starts automatically with `turbo dev` when `CLOUDFLARE_TUNNEL_TOKEN` is set.
This routes `https://dev.dylangattey.com` to your local Next.js server for OAuth and webhook testing.

To set up:

1. Get the tunnel token from [Cloudflare Zero Trust](https://one.dash.cloudflare.com/737867b500ec8ef1d7e5c9650e5dbfdb/networks/tunnels/cfd_tunnel/60e09136-a10f-499c-8925-bcef7570677d/edit?tab=overview)
2. Add it to 1Password as `CLOUDFLARE_TUNNEL_TOKEN`
3. Run `turbo env` to update your `.env`

The tunnel will fail if `CLOUDFLARE_TUNNEL_TOKEN` isn't configured in your `.env`.

#### Webhooks

1. Start `turbo dev`, then visit `/console` in the browser to view webhook status and manage subscriptions. Delete subscriptions when done so Strava doesn't ping a dead endpoint.
2. Add a `console.log` in `apps/web/src/app/api/webhooks/route.ts` and rename an activity to trigger events. [Docs](https://developers.strava.com/docs/webhooks/)

### Versioning

Versioning uses auto-generated version bumps on PRs with GitHub releases on merge. The version is stored in the root `package.json` and read directly by the app at build time. Check the appropriate checkbox in the PR template (Major/Minor/Patch) - the workflow will auto-commit the version bump to your branch and create a GitHub release on merge with notes from the "What changed?" section.

#### Version conflicts

If multiple PRs each have their own version bump and one merges, other PRs will have conflicts in `package.json`. To fix:

1. Run `turbo drop-bot-commits` to remove bot-authored version bumps and rebase onto `origin/main`
2. Force push: `git push --force-with-lease`
3. The workflow will automatically create a fresh version bump commit

### PR screenshots

The repo automatically captures before/after screenshots on PRs comparing production vs the Vercel preview deployment. Screenshots are captured using [@vercel/before-and-after](https://jm.sv/before-and-after) and posted as a PR comment.

#### Configuration

Edit `.github/screenshot-config.json` to customize which pages are captured:

```json
{
  "productionUrl": "https://dylangattey.com",
  "defaultViewport": "1280x800",
  "pages": [
    { "path": "/", "name": "Homepage" },
    { "path": "/music", "name": "Music", "viewport": "1280x800" },
    { "path": "/music", "name": "Music (mobile)", "viewport": "375x812" }
  ]
}
```

Each page can optionally specify:
- `viewport` - Override the default viewport (e.g., `375x812` for mobile)
- `selector` - CSS selector to capture a specific element instead of full page

#### Vercel deployment protection

If preview deployments have password protection enabled (Vercel Deployment Protection), the workflow will attempt to use a bypass secret. To configure:

1. In Vercel: Project Settings > Deployment Protection > Protection Bypass for Automation > Generate secret
2. In GitHub: Settings > Secrets and variables > Actions > Add `VERCEL_AUTOMATION_BYPASS_SECRET` with the same value

The workflow will automatically append the bypass parameter to preview URLs. If no secret is configured or bypass fails, screenshots will be skipped with a note on the PR.

**Known limitation:** When Vercel Deployment Protection is enabled, images in preview screenshots may appear as empty placeholders. This is because the bypass token only authenticates the initial page request, while subsequent image requests through Next.js Image optimization (`/_next/image/*`) don't include the token. Production screenshots will show all images correctly. To get full image loading in previews, disable Vercel Deployment Protection for preview deployments.

[gh]: https://github.com/dgattey/dg
