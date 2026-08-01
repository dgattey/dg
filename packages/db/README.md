# Database

Neon PostgreSQL database with Sequelize ORM for migrations and models.

## Structure

- `migrations/` - Sequelize migration files
- `models/` - Database models (Token, StravaActivity, SpotifyPlay)

## Key Exports

- `db` - Object with all models (StravaActivity, Token, etc)
- `dbClient` - Sequelize client instance
- `connectToDatabase()` - Verify connection (called automatically in non-test environments)
- `closeDbConnection()` - Close connection (used by test cleanup)

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

Test helpers live in this package under `@dg/db/testing`. Runtime app code still
must not import `@dg/db`; tests may import `@dg/db/testing`. `apps/web` tests may
also import `@dg/db` for Sequelize operators such as `Op` (test-only exception).

```ts
import { setupTestDatabase } from '@dg/db/testing/databaseSetup';

const db = setupTestDatabase();

it('creates an activity', async () => {
  await db.StravaActivity.create({ ... });
});
```

`setupTestDatabase()` wraps each test in a transaction (BEGIN/ROLLBACK). Use
`resetTestDatabase()` when you need a full truncate. Jest shared config is
`@dg/db/testing/jest.config.base`. Mocks and other non-DB test utilities live in
`@dg/testing` (see `packages/testing/README.md`).

## Gotchas

- `NODE_ENV` must be `development`, `production`, or `test` or the client throws on import.
- `DATABASE_URL` / `DATABASE_URL_TEST` are required; missing values fail fast.
- In non-test environments, `connectToDatabase()` is called automatically on import.

