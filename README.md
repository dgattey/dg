[![GitHub version](https://badgen.net/github/release/dgattey/dg?cache=600)][gh] [![Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=dg)](https://vercel.com/dgattey/dg) [![GitHub checks](https://badgen.net/github/checks/dgattey/dg)][gh] [![Last commit](https://badgen.net/github/last-commit/dgattey/dg/main)][gh]

# Dylan Gattey

Hi :wave:! This is an overengineered way to show off my past projects/info about me/experiment with new technology. It's a pretty lightweight, mobile-friendly React app, powered by [Next](https://nextjs.org/docs/getting-started) and hosted on [Vercel](https://vercel.com). And it's all Typescript, because we like type safety!

## :hammer: Commands

- `pnpm dev` starts the development server.
- `pnpm build` runs a prod build
- `pnpm build:analyze` builds bundle analysis for a production version of the site to see what it'll look like when deployed
- `pnpm serve` runs a server with the built site
- `pnpm format` runs Prettier to format the files
- `pnpm lint` runs ESLint to lint all TS(X) and JS(X) files
- `pnpm lint:types` runs tsc to confirm no type errors on the same files
- `pnpm codegen` generates new GraphQL APIs from Github/Contentful
- `pnpm db:connect <optional branch>` (assuming you have `pscale` installed locally) connects you to the DB branch specified on port 3309
- `pnpm db:migrate` uses Sequelize to run migrations, and you can list the status of migrations with `pnpm db:migrate:status`. Undo with `pnpm db:migrate:undo`
- `pnpm db:generate` uses Sequelize to generate a new migration file ready to be populated
- `pnpm webhooks:local` (assuming cloudflared is installed via brew) starts a tunnel to dev.dylangattey.com for purposes of testing webhooks
- `pnpm webhooks:create <name>` will create a webhook subscription for the given API - for local dev and requires `webhooks:local` to be running already
- `pnpm webhooks:list <name>` will list that API's webhook subscriptions - for local dev
- `pnpm webhooks:delete <name> <id>` will delete a webhook subscription for that API - for local dev
- `pnpm release` bumps the site version, run via Github Action

## :beginner: Initial Setup

You need Node 18+ and pnpm 7+ installed. Run `pnpm install` to get started once you have those two installed.

## :memo: Pull Requests

Even though it's just me, I use feature branches that merge onto main:

1. Run `git checkout -b feature-name` to make a branch, then commit to it and push to origin.

1. I [create a PR](https://github.com/dgattey/dg/pulls) and make sure there's a label + an [issue](https://github.com/dgattey/dg/issues) the PR "fixes" or "closes".

1. It'll automatically kick off Github Actions for quality, safety, and linting/formatting using CodeQL from Github + my own actions for Autochecks.

1. Check out the Vercel deploy preview to verify it looks good. Once that's good and checks pass, merge and delete the branch and it'll automatically create a new release + deployment for it! :tada:

Other folks: please follow the [Contribution Guidelines](CONTRIBUTING.md).

## :rainbow: Architecture

Pretty standard Next app here. `/public` contains static files, `/src` contains all app code. Global types are in `/src/types` for things like `fetch`/etc. `/src/hooks` contain app-wide hooks. Components, pages are self explanatory. `/src/pages/api` contains API routes for Next. All API code outside the API routes themselves are in `/src/api`. More below.

### Integrations

- [Next](https://nextjs.org/docs/getting-started) is the framework that wraps React. It adds great lazy loading/speed/build time static generation/global CDN/etc to make the site fast + easy to build by default. Notably, there's a "client" + a "server", and client requests to `/api/X` hit the server via `pages/api/X.tsx` and it makes requests directly from the host, enabling use of DB/etc.

- [Vercel](https://vercel.com) hosts + builds the site. Every commit to `main` triggers a new deploy & publish on Vercel :tada:! There's a bunch of env variables matching `.env` but with real data, that are used throughout the system.

- [Cloudflare](https://cloudflare.com) manages DNS/security. Cloudflare's MX records redirect email to Gmail.

- [Contentful](https://www.contentful.com) handles all the content, minus a few things that come from Github itself. Using their GraphQL endpoint, I fetch data all across the site + create components around it. New content triggers a new build via a webhook, so it's always up to date.

- [useSWR](https://swr.vercel.app) is how I keep data all up to date. When Contentful hasn't published something new and you're still on the site, it'll fetch latest data for you. Super cool tool, and it does fancy things with caching too so there's no extra network requests + the UI is _always_ updated. I wrote a strongly typed wrapper around it for endpoints so there's clear things you can fetch from server & there's only one dynamic Next API route needed. Fun!

- [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/api/) shows the map on the homepage and is loaded client side only because of speed/browser APIs it uses. It's huge file wise, but also lazy loaded.

- [MUI System](https://mui.com/system/getting-started/overview/) provides the styling system for layouts/usages of `sx` on props, running on `emotion` under the hood.

- [GraphQL Codegen](https://www.graphql-code-generator.com) makes all the `generated` files. It reads Github + Contentful's API schema + creates types out of them automatically. I run it on command when I write new queries/etc to get their types.

- [PlanetScale](https://planetscale.com) powers a distributed DB. This DB is used to persist auth tokens for Spotify/Strava beyond the lifetime of a deploy + refresh the token as needed.

### API

1. All endpoints are strongly typed + synced between Next client + server with `/src/api/endpoints.ts`. No endpoint should ever be used directly from client, but the types in this file can be used!
1. The strong typing allows `useData` with an `EndpointKey` to be how all components/hooks use data via `useSWR`.
1. It also allows `getStaticProps` and the like to call the fetchers directly to get fallback data for a page via `fetchFallback`.
1. There's only one API route ever - it's a dynamic route that takes zero params other than the route name. It can be multiple levels deep like `/api/content/thing` and it'll be parsed correctly. Also strongly typed, and calls the fetchers directly.
1. `/src/api/server` has all server-only code, including API clients + fetchers themselves. DO NOT import from a client unless you want to leak secrets.

### DB

Because Spotify + Strava use Oauth and I use their APIs to pull stats/etc, I needed a lightweight DB to store auth tokens. That way, I could redeploy without losing them or the refresh tokens that would allow me to fetch new ones. Planetscale comes from the Vercel team and is super easy to use.

There's only two tables, one for the tokens and one for the Strava activities, and they're used from the server only.

1. **Token**: I grab the latest token, see if it's expired, and if so, fetch new data. That's done via Spotify/Strava's APIs + the saved refresh token. Once I persist the new data, I can then call the APIs with the auth tokens. Nice defaults built in so anything missing gives back the right info as possible.
2. **StravaActivity**: I create a row when there's a webhook event with a new activity, and I fetch the whole corresponding activity from Strava's API. If there are data updates, for now I just re-fetch the activity and update the row with new JSON data. I keep track of last update time, so multiple updates in the same time window don't hammer Strava's servers.

To create and run a migration:

1. Run `pnpm db:generate <name>` to create a new migration file
1. Fill it in with the appropriate `up` and `down` code for what you're doing
1. Create a new branch on Planetscale's UI to test with
1. Connect to that branch with `pnpm db:connect <branch>`
1. In a new terminal tab, run `pnpm db:migrate` to run migrations onto that branch.
1. If all looks good, you can deploy request from Planetscale, review, merge, and delete the branch.
1. Migrations can be undone with `pnpm db:migrate:undo`

#### Strava

DO NOT make direct API calls to Strava if you can avoid it. They have a very restrictive API limit. Instead, there are webhooks subscriptions set up to persist new activity data to the db. I then use that data via normal API fetchers, but it never hits their servers outside webhooks.

More annoyingly, each app from Strava only has one possible subscription that it can use. Instead of trying to switch the config every time I want to test locally, there's just two different Strava apps I've created, each used for a different setup. The one connected to my personal Strava account is a test app. The one connected to the +prod account is for the prod app. There's an `/webhooks` API route that handles all the logic when called from a webhook subscription.

Both use the same DB under the hood, but they use different auth tokens, refresh tokens, and callback URLs. An env variable, `process.env.STRAVA_TOKEN_NAME`, is used to switch between them. Note that if you're testing webhook events locally, you'll want to create another branch in the Planetscale DB probably so you don't clobber the DB with simultaneous updates from the local webhook + the live webhook! Or briefly disconnect the prod webhook, then reconnect when done local testing.

Testing locally requires running Cloudflare's Tunnel service. Via it, https://dev.dylangattey.com points to your local (running) Next app if you run `pnpm webhooks:local`. Make sure the config in ~/.cloudflared exposes the `dg` tunnel with `url: http://localhost:3000`. And close when done! The dev Strava app is set up to hit `dev.dylangattey.com` at `/api/webhooks`, whereas the main one uses `dylangattey.com`.

#### Webhooks

Strava is the only thing that supports webhooks right now!

1. To create a subscription, first run `pnpm webhooks:local` after `pnpm dev` starts elsewhere. Then run `pnpm webhooks:create strava` to make a new subscription. This fails if one already exists. For local subscription testing - you want to make sure you delete the subscription after you're done testing so Strava doesn't keep pinging an endpoint that's not currently live.
2. To list existing subscriptions, run `pnpm webhooks:list strava` to get the ids
3. To delete a subscription, run `pnpm webhooks:delete strava <id>` with an id from the list script
4. To test actual event handling, just add a `console.log` in `pages/api/webhooks`. To easily test, change the name of a Strava activity to trigger an event. Details about the events at https://developers.strava.com/docs/webhooks/.
5. If you need to make changes to the prod webhook subscription instead of the local one, change the env variables in `.env.development.local` for `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_TOKEN_NAME`, and `STRAVA_VERIFY_TOKEN` to match the values on Vercel. Restart everything, and you'll be running against the prod webhook setup. These subscriptions are only ever able to be changed locally with this script, or manually with a curl, to prevent tampering.

### Versioning

Standard semver versioning is done via `semantic-release` and Conventional Commits for the commit messages. Typically I bump the major when there's a major rewrite, and that's it.

- **Major**: bumped if "!" appears after the subject of the commit message
- **Minor**: bumped if "feat:" appears in the message
- **Patch**: bumped by default in all other cases ("chore:"/"fix:"/etc)

### History

The site was originally Wordpress for way too many years! I used a custom theme + had a bunch of optimizations starting way back in ~2011.

**Version 0** + this repo appeared in spring 2016, with Gulp + Angular 1 (yikes :yikes:) + Wordpress JSON as a content API. The templates were very hand-written, with separate CSS/HTML files. Shockingly, there was some Typescript for the data models, even way back then. RXJS made an appearance for some functional programming!

**Version 0.1** marked me getting fed up with Angular + the delicateness of build systems in summer 2016. Most of the app wasn't JS-necessary, so I swapped to HTML + Liquid templates + a really basic app using Jekyll. I put the content right in the repo instead of using Wordpress still. Getting things optimized was a little rough, but there were some plugins to make it work. That got me through a few years with mostly content updates.

**Version 0.4** was me changing the design in Jan 2019 cause I got bored of the static grid there once was and I like tweaking. I focused on speed and added plugins/optimized my way to a good Lighthouse score. But once I started getting an asset pipeline with automatic webp image generation/etc, it got hairy. I had a TON of fun with Content Security Policy and eventually scrapped that since it was so brittle. Getting a service worker actually serving offline data was pretty cool though! Around this time, I swapped from a manual script that ran the Jekyll build to Netlify + using an automated deploy. Night and day!

**Version 1.0.0** in spring 2019 was where I relaunched the Jekyll site on Netlify, then promptly tweaked CSP + the service worker for another month. I added linters + wrote a little webhook script to automatically bump the version. I kept redesigning the grid to make it more interactive + added a more complicated About page + tweaked CSP further. By this point I had multiple layers of caching, JS + HTML + SCSS + a custom image pipeline script. Way too much for Jekyll alone. At the end of 2019 I stopped working on the site for awhile.

**Version 2.0.0** marked me getting semantic-release implemented + swapping to Gatbsy in spring 2021 as I converted the site to a JS based workflow that used Contentful to pull data to create the actual site. Ultimately Gatbsy was buggy + tediously slow to use, even though its GraphQL usage was sick.

**Version 2.5.0** at the end of 2021 was the swap to Next as a framework + Vercel as a host to deploy it since Netlify had gotten crusty. Also, I made Typescript the language of choice instead of the hybrid mix I'd used with Gatsby. I added features like a map to show my location, light/dark mode (finally), Spotify + Strava to show my latest stats, and new projects I'd worked on since 2019. I released the Next version of the site in spring 2022, with content fully separated from design to make it easier to keep it updated through the years. With Vercel + modern React, I'm much better set up for no design changes for awhile.

[gh]: https://github.com/dgattey/dg
