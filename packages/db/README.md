# Database

Neon PostgreSQL database with Sequelize ORM for migrations and models.

## Structure

- `migrations/` - Sequelize migration files
- `models/` - Database models (`FavoriteAlbum`, `FavoriteAlbumSnapshot`, `MusicAlbum`, `MusicAlbumArtist`, `MusicArtist`, `MusicPlaylist`, `MusicTrack`, `MusicTrackArtist`, `MusicTrackPopularity`, `MusicTrackTempo`, `OauthState`, `Release`, `SpotifyPlay`, `StravaActivity`, `StravaHistorySummary`, `Token`)

## Key Exports

- `db` - Object with all models (`StravaActivity`, `Token`, etc.)
- `dbClient` - Sequelize client instance (connects lazily on the first query)
- `closeDbConnection()` - Close connection (used by test and script cleanup)

## Commands

- `turbo migrate` - Run pending migrations
- `turbo migrate:generate -- --name <name>` - Create new migration
- `turbo migrate:status` - Show migration status
- `turbo migrate:undo` - Rollback last migration

## Environment

- `DATABASE_URL` - Connection string for development/production
- `DATABASE_URL_TEST` - Connection string for tests (required when `NODE_ENV=test`)

The `getDatabaseUrl()` function looks up the correct URL based on `NODE_ENV` and fails loudly if not set.

## Testing

Test helpers live in this package under `@dg/db/testing`. Only `packages/services`
tests may import `@dg/db` or `@dg/db/testing`; `apps/*` runtime, test, and Jest
config files must never import `@dg/db` or `@dg/db/testing`.

```ts
import { setupTestDatabase } from '@dg/db/testing/databaseSetup';

const db = setupTestDatabase();

it('creates an activity', async () => {
  await db.StravaActivity.create({ ... });
});
```

`setupTestDatabase()` wraps each test in a transaction (`BEGIN` and `ROLLBACK`), while `jest.globalSetup.ts` runs pending migrations and truncates tables once before the test run. Jest shared config is `@dg/db/testing/jest.config.base`. Mocks and other non-DB test utilities live in `@dg/testing`.

## Gotchas

- `DATABASE_URL` or `DATABASE_URL_TEST` is validated on first connection; missing values fail fast when a query runs.

