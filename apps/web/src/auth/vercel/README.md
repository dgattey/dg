# Sign in with Vercel for Flags targeting

Optional OAuth on `/dev-console` that gives Vercel Flags a real `user.id` / `user.email` for segment rules. Dashboard login alone does not identify the visitor to this app.

## Why

`dylangattey.com` has no general user auth. Being logged into the Vercel dashboard is not an evaluation identity the Flags SDK can read. Flags need `identify` to return entities (here `user.id` and `user.email`) before Segments can match “just Dylan.”

Toolbar / Flags Explorer overrides still work without this flow (per-browser override cookie via `FLAGS_SECRET`). Use Sign in when you want durable, dashboard-managed targeting across browsers.

## Flow

1. Open `/dev-console` (Basic Auth is separate — see Security).
2. Click **Sign in with Vercel** → PKCE authorize at `https://vercel.com/oauth/authorize`.
3. Callback exchanges the code, loads userinfo, and sets a signed HttpOnly `vercel_flags_session` cookie with `{ id: sub, email, name? }`. Vercel access/refresh tokens are **not** stored.
4. `apps/web/src/flags.ts` `identify` reads that cookie and returns `{ user?: { id, email } }` for flags that share it (e.g. `interactive-redesign`).
5. Flags dashboard Entities + Segment rules match on `user.id` / `user.email` and attach to the flag.

Logout clears the session cookie via `/api/auth/vercel/logout`.

## Dashboard setup

One-time human setup under team `dylan-gattey`:

1. Team Settings → Apps → Create app.
2. Authorization callback URLs:
   - `http://localhost:3000/api/auth/vercel/callback`
   - `https://dylangattey.com/api/auth/vercel/callback`
   - Optionally the preview project URL + `/api/auth/vercel/callback`
3. Scopes: `openid`, `email`, `profile` (no `offline_access` — identity claims only).
4. Env (Preview + Production on the Vercel project, and 1Password vault `dg` items with a `value` field so `turbo env` can generate `.env`):
   - `NEXT_PUBLIC_VERCEL_APP_CLIENT_ID`
   - `VERCEL_APP_CLIENT_SECRET`
   - Both keys are listed in `config/env.secrets.keys`. Session HMAC uses `VERCEL_APP_CLIENT_SECRET`.
5. Flags → Entities: `user` with string attributes `id`, `email`.
6. Flags → Segments: e.g. `dylan` with `user.email equals <your email>` or `user.id equals <sub from first login>`.
7. Flag `interactive-redesign` → target that segment → `true`.

## Security

- Any Vercel account can complete OAuth. “Just me” is the Segment rule on your id/email, not the login button.
- The Flags session does **not** bypass `/dev-console` Basic Auth (`apps/web/src/proxy.ts`). Those are independent gates.
- Cookie is HttpOnly, HMAC-signed, 30-day max age; payload is identity only.

## Fallback

Vercel Toolbar → Flags / Flags Explorer override for `interactive-redesign` still works without Sign in. Override is browser-local and requires `FLAGS_SECRET` on the project.

## Code map

| Piece | Path |
| --- | --- |
| Flag + `identify` | `apps/web/src/flags.ts` |
| Session cookie sign/verify | `apps/web/src/auth/vercel/session.ts` |
| Authorize (PKCE) | `apps/web/src/app/api/auth/vercel/route.ts` |
| Callback | `apps/web/src/app/api/auth/vercel/callback/route.ts` |
| Logout | `apps/web/src/app/api/auth/vercel/logout/route.ts` |
| Dev-console UI | `apps/web/src/app/dev-console/vercel/VercelSignInCard.tsx` |
| Basic Auth on `/dev-console` | `apps/web/src/proxy.ts` |
| Env key list | `config/env.secrets.keys` |
| Flags discovery | `apps/web/src/app/.well-known/vercel/flags/route.ts` |
