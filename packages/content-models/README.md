# Content Models

Type definitions, schemas, and pure transformations for external API data. This package defines the **shape** of data without any I/O operations.

## Separation from Services

| Package | Responsibility | Example |
|---------|---------------|---------|
| `content-models` | Types, schemas, validation, pure transforms | `RenderableLink`, `Track`, Valibot schemas |
| `services` | Server-side I/O (API calls, DB, auth) | `fetchProjects()`, `spotifyClient` |

**Rule of thumb**: If it makes an HTTP request, touches the database, or requires `server-only`, it belongs in `services`. If it's a type, schema, or pure function on data shapes, it belongs here.

## Structure

```
content-models/
├── contentful/
│   ├── schema/           # Valibot schemas for GraphQL responses
│   ├── renderables/      # Transformed types for UI consumption
│   ├── schema.graphql    # GraphQL schema for editor tooling
│   └── MapLocation.ts    # Location helper
├── spotify/
│   ├── CurrentlyPlaying.ts
│   ├── RecentlyPlayed.ts
│   └── Track.ts          # Shared track schema
└── strava/
    ├── StravaActivity.ts
    └── StravaWebhookEvent.ts
```

## Contentful

### Schema (`contentful/schema/`)

Valibot schemas that validate raw GraphQL responses from Contentful.

| File | Description |
|------|-------------|
| `shared.ts` | Common types: `Asset`, `Link`, `Sys` |
| `intro.ts` | Homepage intro content schema |
| `projects.ts` | Project card schema |
| `footer.ts` | Footer links schema |
| `location.ts` | Map location schema |

### Renderables (`contentful/renderables/`)

Transformed types ready for UI consumption. These strip nulls, flatten structures, and provide helper functions.

| File | Exports |
|------|---------|
| `assets.ts` | `RenderableAsset`, `toRenderableAsset()` |
| `links.ts` | `RenderableLink`, `toRenderableLink()` |
| `intro.ts` | `RenderableIntro`, `toRenderableIntro()` |
| `projects.ts` | `RenderableProject`, `toRenderableProject()` |
| `richText.ts` | `RenderableRichText`, `toRenderableRichText()` |

## Spotify

Valibot schemas for Spotify API responses.

| File | Description |
|------|-------------|
| `Track.ts` | Shared track type with artist, album, images |
| `CurrentlyPlaying.ts` | Currently playing response (includes `is_playing`) |
| `RecentlyPlayed.ts` | Recently played tracks array |

## Strava

Valibot schemas for Strava API responses and webhooks.

| File | Description |
|------|-------------|
| `StravaActivity.ts` | Activity data from API |
| `StravaWebhookEvent.ts` | Webhook event payload |

## Scripts

- `pnpm graphql:schema` - Fetches latest Contentful GraphQL schema for editor tooling

## Dependencies

- `valibot` - Schema validation
- `@contentful/rich-text-types` - Contentful rich text node types
- `@dg/shared-core` - Shared utilities
