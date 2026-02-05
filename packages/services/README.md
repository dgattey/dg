# Services

Server-side API integrations and data fetching for external services. This package is marked `server-only` to ensure these functions only run on the server.

## Separation from Content Models

| Package | Responsibility | Example |
|---------|---------------|---------|
| `services` | Server-side I/O (API calls, DB, auth) | `fetchProjects()`, `spotifyClient` |
| `content-models` | Types, schemas, validation, pure transforms | `RenderableLink`, `Track`, Valibot schemas |

**Rule of thumb**: If it makes an HTTP request, touches the database, or requires `server-only`, it belongs here. If it's a type, schema, or pure function on data shapes, it belongs in `content-models`.

## Structure

```
services/
├── clients/          # Reusable HTTP client utilities
├── images/           # Server-side image utilities
├── contentful/       # Contentful CMS integration
├── spotify/          # Spotify API integration
├── strava/           # Strava API integration
```

## Clients

Low-level HTTP client utilities used by service integrations:

| File | Description |
|------|-------------|
| `authenticatedGraphQLClient.ts` | GraphQL client with OAuth token refresh |
| `authenticatedRestClient.ts` | REST client with OAuth token refresh |
| `unauthenticatedRestClient.ts` | Simple REST client without auth |
| `refreshedAccessToken.ts` | Token refresh logic for OAuth flows |
| `RefreshTokenConfig.ts` | Configuration type for token refresh |
| `getStatus.ts` | HTTP status code helpers |

## Images

Server-side image utilities for creating UI-friendly derived data.

| Export | Description |
|--------|-------------|
| `getImageGradientFromUrl()` | Builds a CSS gradient + contrast hint from an image URL |

## Contentful

CMS integration for site content. Uses GraphQL with Valibot-validated responses.

| Export | Description |
|--------|-------------|
| `fetchIntroContent()` | Homepage intro text block and image |
| `fetchProjects()` | Project cards for homepage |
| `fetchFooterLinks()` | Footer navigation links |
| `fetchLinkByName(name)` | Single link by title (partial match) |
| `fetchCurrentLocation()` | Current map location marker |
| `contentfulClient` | Configured GraphQL client |

**Schema**: `@dg/content-models/contentful/schema.graphql` is checked in for editor tooling and refreshed via `pnpm graphql:schema`.

**Type imports from `ui` package** (type-only, no runtime dependency):
- `ui/dependent/Image.tsx` → `Asset`
- `ui/dependent/ContentCard.tsx` → `Link`
- `ui/dependent/ContentWrappingLink.tsx` → `Link`

## Spotify

Spotify API integration for currently playing/recently played tracks.

| Export | Description |
|--------|-------------|
| `fetchRecentlyPlayed()` | Gets recently played or currently playing track |
| `spotifyClient` | Configured REST client with token refresh |
| `CurrentlyPlaying` | Type in `@dg/content-models/spotify/CurrentlyPlaying` |
| `RecentlyPlayed` | Type in `@dg/content-models/spotify/RecentlyPlayed` |
| `Track` | Shared track type in `@dg/content-models/spotify/Track` |

## Strava

Strava API integration for activity data and webhooks.

| Export | Description |
|--------|-------------|
| `fetchLatestStravaActivityFromDb()` | Gets latest activity from database cache |
| `fetchStravaActivityFromApi()` | Fetches activity directly from Strava API |
| `syncStravaWebhookUpdateWithDb()` | Syncs webhook updates to database |
| `echoStravaChallengeIfValid()` | Handles Strava webhook verification |
| `exchangeCodeForToken()` | Exchanges an OAuth code for tokens |
| `mapActivityFromApi()` | Converts API response (snake_case) to domain format |
| `stravaClient` | Configured REST client with token refresh |
| `stravaTokenExchangeClient` | Client for OAuth token exchange |
| `StravaWebhookEvent` | Type in `@dg/content-models/strava/StravaWebhookEvent` |

### Webhook Subscription Management

Functions for managing Strava webhook subscriptions (in `strava/webhooks/`):

| Export | Description |
|--------|-------------|
| `listSubscriptions(type)` | Lists all webhook subscriptions |
| `createSubscription(type)` | Creates a new webhook subscription |
| `deleteSubscription(type, id)` | Deletes a webhook subscription by ID |

## Environment Variables

Required environment variables (see `config/env.secrets.keys`):

- `CONTENTFUL_ACCESS_TOKEN` - Contentful API access token
- `CONTENTFUL_SPACE_ID` - Contentful space identifier
- `SPOTIFY_CLIENT_ID` - Spotify OAuth client ID (PKCE, no secret required)
- `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET` - Strava OAuth credentials
- `STRAVA_VERIFY_TOKEN` - Webhook verification token
- `DATABASE_URL` - PostgreSQL connection string (for Strava caching)

## Dependencies

- `db` - Database models for Strava activity caching
- `shared-core` - Shared utilities
- `graphql-request` - GraphQL client
- `wretch` - Fetch wrapper for REST APIs
