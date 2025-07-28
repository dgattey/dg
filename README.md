[![GitHub version](https://flat.badgen.net/github/release/dgattey/dg?cache=600)][gh] [![Vercel](https://deploy-badge.vercel.app/vercel/?app=dg&style=flat-square)](https://vercel.com/dgattey/dg) [![GitHub commits](https://flat.badgen.net/github/commits/dgattey/dg)][gh] [![Last commit](https://flat.badgen.net/github/last-commit/dgattey/dg/main)][gh]

# Dylan Gattey

Hi :wave: This is an overengineered way to show my past projects/experiment with new technology. It's a lightweight, mobile-friendly React app in Typescript, powered by [Next](https://nextjs.org/docs/getting-started) and hosted on [Vercel](https://vercel.com). It's set up as a monorepo, using [pnpm](https://pnpm.io) workspaces and [Turbo](https://turbo.run) as a command runner.

## :hammer: Commands

- `turbo dev` starts the development server + db connection to the prod DB (be careful!)
- `turbo build` runs a prod build (for CI)
- `turbo build:serve` runs a prod build + db connection + serves it (for local testing)
- `turbo build:analyze` builds shows bundle sizes for a prod build (for verification)
- `turbo format` runs Biome to format the files
- `turbo lint` runs ESLint to lint files
- `turbo lint:types` runs tsc to confirm no type errors
- `turbo codegen` generates new GraphQL APIs from Github/Contentful + operation file types from the queries/mutations
- `turbo db -- db:migrate` uses Sequelize to run migrations, and you can list the status of migrations with `turbo db -- db:migrate:status`. Undo with `turbo db -- db:migrate:undo`
- `turbo db -- migration:generate --name <name>` uses Sequelize to generate a new migration file ready to be populated
- `turbo webhook -- create <name>` will create a webhook subscription for the given API - for local dev and requires `dev` to be running already
- `turbo webhook -- list <name>` will list that API's webhook subscriptions - for local dev
- `turbo webhook -- delete <name> <id>` will delete a webhook subscription for that API - for local dev
- `turbo release` bumps the site version, run via Github Action
- `turbo clean` cleans up any built files like Next caches + codegen'd files
- `turbo topo --graph=graph.html ` generates a graph of the monorepo dependencies for visualization

## :beginner: Initial Setup

You need Node 20+ installed. Install `pnpm` via corepack, then run `pnpm install`. You also need `neonctl` installed globally for the db, via `brew install neonctl`.

## :memo: Pull Requests

Even though it's just me, I use feature branches that squash onto main, and Linear for ticket tracking.

1. PR creation will kick off Github actions for linting/formatting + post a comment about the new version.
1. Use the Vercel deploy preview to verify functionality.
1. Merges will automatically create a new version/release 🎉

## :rainbow: Architecture

Pretty standard Next app here. `/public` contains static files, `/src` contains all app code. Global types are in `/src/types` for things like `fetch`/etc. `/src/hooks` contain app-wide hooks. Components, pages are self explanatory. `/src/pages/api` contains API routes for Next. All API code outside the API routes themselves are in `/src/api`. More below.

### Integrations

- [Next](https://nextjs.org/docs/getting-started) is the framework that wraps React. It adds great lazy loading/speed/build time static generation/global CDN/etc to make the site fast + easy to build by default. Notably, there's a "client" + a "server", and client requests to `/api/X` hit the server via `pages/api/X.tsx` and it makes requests directly from the host, enabling use of DB/etc.

- [Vercel](https://vercel.com) hosts + builds the site. Every commit to `main` triggers a new deploy & publish on Vercel :tada:! There's a bunch of env variables matching `.env` but with real data, that are used throughout the system.

- [Cloudflare](https://cloudflare.com) manages DNS/security. Cloudflare's MX records redirect email to Gmail.

- [Contentful](https://www.contentful.com) handles most of the content. Using their GraphQL endpoint, I fetch data all across the site + create components around it. New content triggers a new build via a webhook, so it's always up to date.

- [useSWR](https://swr.vercel.app) is how I keep data all up to date. When Contentful hasn't published something new and you're still on the site, it'll fetch latest data for you. Super cool tool, and it does fancy things with caching too so there's no extra network requests + the UI is _always_ updated. I wrote a strongly typed wrapper around it for endpoints so there's clear things you can fetch from server & there's only one dynamic Next API route needed.

- [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/api/) shows the map on the homepage and is lazy loaded client side only after hovering a map, because of speed.

- [MUI](https://mui.com/material/) provides the styling system for layouts/usages of `sx` on props, running on `emotion` under the hood.

- [GraphQL Codegen](https://www.graphql-code-generator.com) makes all the `*.generated.ts` files. It reads Github + Contentful's API schema + creates types out of them automatically. I run it on command when I write new queries/etc to get their types.

- [Neon](https://neon.tech) powers a distributed DB. This DB is used to persist auth tokens for Spotify/Strava beyond the lifetime of a deploy + refresh the token as needed.

- [Sequelize](https://sequelize.org) is used to run migrations on the DB + interact with it. It's a lightweight ORM that makes sure my DB tables have the right shapes and fields.

### API

1. All endpoints are strongly typed + synced between Next client + server with `/src/api/endpoints.ts`. No endpoint should ever be used directly from client, but the types in this file can be used!
1. The strong typing allows `useData` with an `EndpointKey` to be how all components/hooks use data via `useSWR`.
1. It also allows `getStaticProps` and the like to call the fetchers directly to get fallback data for a page via `fetchFallback`.
1. There's only one API route ever - it's a dynamic route that takes zero params other than the route name. It can be multiple levels deep like `/api/content/thing` and it'll be parsed correctly. Also strongly typed, and calls the fetchers directly.
1. `/src/api/server` has all server-only code, including API clients + fetchers themselves. DO NOT import from a client unless you want to leak secrets.

### DB

Because Spotify + Strava use Oauth and I use their APIs to pull stats/etc, I needed a lightweight DB to store auth tokens. I use Neon + Sequelize for this.

There are two tables:

1. **Token**: I grab the latest token, see if it's expired, and if so, fetch new data. That's done via Spotify/Strava's APIs + the saved refresh token. Once I persist the new data, I can then call the APIs with the auth tokens. Nice defaults built in so anything missing gives back the right info as possible.
2. **StravaActivity**: I create a row when there's a webhook event with a new activity, and I fetch the whole corresponding activity from Strava's API. If there are data updates, for now I just re-fetch the activity and update the row with new JSON data. I keep track of last update time, so multiple updates in the same time window don't hammer Strava's servers.

To create and run a migration:

1. Run `turbo db -- migration:generate --name <name>` to create a new migration file
1. Fill it in with the appropriate `up` and `down` code for what you're doing
1. Create a new branch on Neon's UI to test with
1. Connect to that branch with `turbo connect -- <branch>` and then start a new server with `turbo dev`
1. In a new terminal tab, run `turbo db -- db:migrate` to run migrations onto that branch.
1. If all looks good, you can deploy request from Neon, review, merge, and delete the branch.
1. Migrations can be undone with `turbo db -- db:migrate:undo`

#### Strava

DO NOT make direct API calls to Strava if you can avoid it. They have a very restrictive API limit. Instead, there are webhooks subscriptions set up to persist new activity data to the db. I then use that data via normal API fetchers, but it never hits their servers outside webhooks.

More annoyingly, each app from Strava only has one possible subscription that it can use. Instead of trying to switch the config every time I want to test locally, there's just two different Strava apps I've created, each used for a different setup. The one connected to my personal Strava account is a test app. The one connected to the +prod account is for the prod app. There's an `/webhooks` API route that handles all the logic when called from a webhook subscription.

Both use the same DB under the hood, but they use different auth tokens, refresh tokens, and callback URLs. An env variable, `process.env.STRAVA_TOKEN_NAME`, is used to switch between them. Note that if you're testing webhook events locally, you'll want to create another branch in the Neon DB probably so you don't clobber the DB with simultaneous updates from the local webhook + the live webhook! Or briefly disconnect the prod webhook, then reconnect when done local testing.

##### Cloudflare Tunnels

Testing locally requires running Cloudflare's Tunnel service. Via it, https://dev.dylangattey.com/api/webhooks points to your local (running) Next app if you run `turbo dev`. Here's how it works:

1. Visit the tunnel's [config page](https://one.dash.cloudflare.com/737867b500ec8ef1d7e5c9650e5dbfdb/networks/tunnels/cfd_tunnel/60e09136-a10f-499c-8925-bcef7570677d/edit?tab=overview) and use the "Install and run a connector" section to start a persistent service. Change it here if `api/webhooks` ever moves.
1. That will enable a persistent service on your device that will kep the tunnel open.
1. To debug prod, you can temporarily change the `STRAVA` env variables to the prod values (except the callback url!) and log into Strava and change the accepted domain to the `dev` subdomain. Then, delete the current subscription, recreate, and try editing. Visit the `api/webhooks` to restart the oauth flow on dev.

#### Webhooks

Strava is the only thing that supports webhooks right now!

1. To create a subscription, first run `turbo dev` starts elsewhere. Then run `turbo webhook -- create strava` to make a new subscription. This fails if one already exists. For local subscription testing - you want to make sure you delete the subscription after you're done testing so Strava doesn't keep pinging an endpoint that's not currently live.
2. To list existing subscriptions, run `turbo webhook -- list strava` to get the ids
3. To delete a subscription, run `turbo webhook -- delete strava <id>` with an id from the list script
4. To test actual event handling, just add a `console.log` in `pages/api/webhooks`. To easily test, change the name of a Strava activity to trigger an event. Details about the events at https://developers.strava.com/docs/webhooks/.
5. If you need to make changes to the prod webhook subscription instead of the local one, change the env variables in `.env.development.local` for `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_TOKEN_NAME`, and `STRAVA_VERIFY_TOKEN` to match the values on Vercel. Restart everything, and you'll be running against the prod webhook setup. These subscriptions are only ever able to be changed locally with this script, or manually with a curl, to prevent tampering.

### Versioning

Standard semver versioning is done via `semantic-release` and Conventional Commits for the commit messages. Typically I bump the major when there's a major rewrite, and that's it.

- **Major**: bumped if "!" appears after the subject of the commit message
- **Minor**: bumped if "feat:" appears in the message
- **Patch**: bumped by default in all other cases ("chore:"/"fix:"/etc)

Test a dry run with `GITHUB_TOKEN=* pnpm turbo release -- --dry-run --branches={branch here}` after filling in the token, or done for you on all PRs.

[gh]: https://github.com/dgattey/dg