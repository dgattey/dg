# Database

Neon PostgreSQL database with Sequelize ORM for migrations and models.

## Structure

- `migrations/` - Sequelize migration files
- `models/` - Database models (Token, StravaActivity, SpotifyPlay)

## Key Exports

- `Token` - OAuth token storage for Spotify/Strava
- `StravaActivity` - Cached Strava activity data from webhooks
- `SpotifyPlay` - Spotify listening history rows
- `db` - Sequelize client instance

## Commands

- `turbo db -- db:migrate` - Run pending migrations
- `turbo db -- db:migrate:undo` - Rollback last migration
- `turbo db -- migration:generate --name <name>` - Create new migration

## Environment

- `DATABASE_URL` - Connection string for development/production (from 1Password)
- `DATABASE_URL_TEST` - Connection string for tests (from 1Password, **required** for tests)

Tests run with `NODE_ENV=test` so the DB client uses `DATABASE_URL_TEST`.

## Testing

Tests that need database access use `setupTestDatabase()`:

```ts
// In apps/*, import from services (per db-imports rule):
import { setupTestDatabase } from '@dg/services/testing/setupTestDatabase';

// In packages/services, import directly:
import { setupTestDatabase } from '@dg/db/testing';

let db: Awaited<ReturnType<typeof setupTestDatabase>>;

beforeAll(async () => {
  db = await setupTestDatabase();
});

beforeEach(async () => {
  await db.SpotifyPlay.destroy({ truncate: true });
});
```

This function:
1. **Fails loudly** if `DATABASE_URL_TEST` is not set
2. **Fails loudly** if `NODE_ENV` is not `test`
3. **Runs pending migrations** to ensure schema is up to date
4. Returns the `db` object for querying

### Global Setup

Jest global setup (`apps/web/jest.globalSetup.ts`) automatically:
- Calls `setupTestDatabase()` to run migrations
- Calls `resetTestDatabase()` to truncate all tables before tests

Jest global teardown closes the database connection.

## Gotchas

- `NODE_ENV` must be `development`, `production`, or `test` or the client throws on import.
- `DATABASE_URL` / `DATABASE_URL_TEST` are required; missing values fail fast.
- `dbClient.authenticate()` runs on import and can throw asynchronously after startup.
- CLI vs runtime SSL options differ (CLI uses `rejectUnauthorized: false`, runtime uses `true`).
