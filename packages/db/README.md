# Database

Neon PostgreSQL database with Sequelize ORM for migrations and models.

## Structure

- `migrations/` - Sequelize migration files
- `models/` - Database models (Token, StravaActivity)

## Key Exports

- `db` - Object with all models (StravaActivity, Token)
- `dbClient` - Sequelize client instance
- `connectToDatabase()` - Verify connection (called automatically in non-test environments)
- `closeDbConnection()` - Close connection (used by test cleanup)

## Commands

- `turbo migrate` - Run pending migrations
- `turbo db -- db:migrate:undo` - Rollback last migration
- `turbo db -- migration:generate --name <name>` - Create new migration

## Environment

- `DATABASE_URL` - Connection string for development/production
- `DATABASE_URL_TEST` - Connection string for tests (required when `NODE_ENV=test`)

The `getDatabaseUrl()` function looks up the correct URL based on `NODE_ENV` and fails loudly if not set.

## Testing

For test database setup, use `@dg/testing`:

```ts
import { setupTestDatabase } from '@dg/testing/databaseSetup';
import { setupMockLifecycle } from '@dg/testing/mocks';

const db = setupTestDatabase({ truncate: ['StravaActivity'] });
setupMockLifecycle();

it('creates an activity', async () => {
  await db.StravaActivity.create({ ... });
});
```

See `packages/testing/README.md` for full documentation.

## Gotchas

- `NODE_ENV` must be `development`, `production`, or `test` or the client throws on import.
- `DATABASE_URL` / `DATABASE_URL_TEST` are required; missing values fail fast.
- In non-test environments, `connectToDatabase()` is called automatically on import.
