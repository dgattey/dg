# Spotify sync Worker

Cloudflare Worker `dg-spotify-sync`. Its `*/15 * * * *` cron trigger calls `GET https://dylangattey.com/api/spotify/sync` with `Authorization: Bearer $CRON_SECRET`, logs failures, and does nothing else. GitHub's scheduled workflows ran hours late, and Vercel Hobby crons only run daily, so the schedule lives here.

It runs on the Workers Free plan: about 96 invocations a day against the 100,000 a day limit. The Free plan has no overage billing; past the limit Cloudflare returns errors instead of charging. The Worker binds nothing billable (only `SITE_URL` and `CRON_SECRET`).

## Deploys

Every push to `main` runs the `☁️ Deploy Spotify sync Worker` job in `.github/workflows/ci.yml` after the checks pass. It runs `turbo deploy --filter=@dg/spotify-sync`, which runs this workspace's checks and tests, then `wrangler deploy --secrets-file deploy-secrets.env`. That uploads the code, cron trigger, `SITE_URL`, observability settings, and `CRON_SECRET` from `wrangler.jsonc` and the CI environment. Nothing is configured by hand on the Worker.

The job needs three GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`: a Cloudflare account API token made from the "Edit Cloudflare Workers" template, limited to Dylan's account.
- `CLOUDFLARE_ACCOUNT_ID`: that account's ID.
- `CRON_SECRET`: the site's cron secret, which `release.yml` already uses.

Don't deploy from a laptop. The deploy script refuses to run without `CRON_SECRET`, so it can't upload an empty secret.

## `CRON_SECRET`

The value lives in 1Password (`dg` vault, listed in `config/env.secrets.keys`) and is copied to the site's Vercel env and to the GitHub Actions secret, the same as before this Worker existed. The Worker never gets its own hand-set copy: each deploy uploads GitHub's value.

To rotate it:

1. Update the 1Password item, the Vercel production `CRON_SECRET`, and the GitHub `CRON_SECRET` secret.
2. Re-run the latest `CI` run on `main` (or merge anything) so the Worker picks up the new value.

A missed step fails loudly rather than silently:

- If GitHub's copy is stale, the release step in `release.yml` fails on the next merge, because it sends the same secret to `/api/releases`.
- If the Worker's copy is stale, every run logs `Spotify sync failed` with a 401. Workers Issues groups that into an issue, and the "dg-spotify-sync issues" notification policy emails Dylan. One automation fires on the first occurrence and another fires again whenever the issue comes back after an hour of quiet.

## Debugging

- Runs and failures: Cloudflare dashboard, Workers & Pages, `dg-spotify-sync`, Observability (Logs and Issues).
- Tests: `turbo test --filter=@dg/spotify-sync`.
- Local cron: `pnpm --filter=@dg/spotify-sync exec wrangler dev --test-scheduled`, then `curl "http://localhost:8787/__scheduled?cron=*/15+*+*+*+*"`. This calls production unless you override `SITE_URL`.
