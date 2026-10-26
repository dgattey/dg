# Sign in with Vercel for `/dev-console`

OAuth login on `/dev-console` that authenticates the site owner (`dgattey`) to manage OAuth connections and Strava webhooks in production without HTTP Basic Auth.

## Flow

1. Open `/dev-console`. In local development (`NODE_ENV=development`), the console tools are unlocked automatically; in production, only the **Access** sign-in card is shown until you sign in.
2. Click **Sign in with Vercel** → PKCE authorize at `https://vercel.com/oauth/authorize`.
3. Callback (`/api/auth/vercel/callback`) verifies the PKCE `state` and OIDC `nonce`, exchanges the authorization code, fetches userinfo (`https://api.vercel.com/login/oauth/userinfo`), verifies that the account belongs to the site owner (`isAuthorizedVercelUser`), and sets a signed HttpOnly `vercel_session` cookie. Vercel access/refresh tokens are **not** stored.
4. Once authenticated, `/dev-console` renders the **OAuth connections** (`Strava`, `Spotify`) and **Tools** (`Strava webhooks`) sections, and Server Actions (`withDevConsoleAuth`) and OAuth initiation (`/api/oauth?provider=...`) allow mutations.

Sign out is a form bound to the `signOutOfVercel` Server Action, which clears the session cookie. It stays a POST so Next.js `<Link>` prefetching cannot trigger sign-out when the card renders.

## Dashboard setup

One-time setup under team `dylan-gattey`:

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

## Security

- Only the site owner's Vercel identity (`isAuthorizedVercelUser` in `apps/web/src/auth/vercel/session.ts`) can mint or validate a `vercel_session` cookie; any other Vercel account is rejected at callback with `reason=unauthorized_user`.
- Cookie is HttpOnly, HMAC-signed (`sha256`), 30-day max age; payload is identity only.
- Server Actions (`withDevConsoleAuth` in `apps/web/src/services/devConsoleAuth.ts`) and OAuth initiation (`requireDevConsoleAuth` in `apps/web/src/app/api/apiResponses.ts`) enforce the same session check on the server.

## Code map

| Piece | Path |
| --- | --- |
| Session cookie sign/verify & owner check | `apps/web/src/auth/vercel/session.ts` |
| Server session reader | `apps/web/src/auth/vercel/getVercelSession.ts` |
| Authorize (PKCE) | `apps/web/src/app/api/auth/vercel/route.ts` |
| Callback | `apps/web/src/app/api/auth/vercel/callback/route.ts` |
| Sign out (Server Action) | `apps/web/src/auth/vercel/session.actions.ts` |
| Server Action auth wrapper | `apps/web/src/services/devConsoleAuth.ts` |
| Dev-console UI | `apps/web/src/app/dev-console/vercel/VercelSignInCard.tsx` |
| Env key list | `config/env.secrets.keys` |
