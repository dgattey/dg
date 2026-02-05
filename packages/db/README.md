# Database

Neon PostgreSQL database with Sequelize ORM for migrations and models.

## Structure

- `migrations/` - Sequelize migration files
- `models/` - Database models (Token, StravaActivity)

## Key Exports

- `Token` - OAuth token storage for Spotify/Strava
- `StravaActivity` - Cached Strava activity data from webhooks
- `db` - Sequelize client instance

## Commands

- `turbo migrate` - Run pending migrations
- `turbo db -- db:migrate:undo` - Rollback last migration
- `turbo db -- migration:generate --name <name>` - Create new migration

## Environment

- `DATABASE_URL` - Connection string for development/production (from 1Password)
- `DATABASE_URL_TEST` - Connection string for tests (from 1Password, **required** for tests)

Tests run with `NODE_ENV=test` so the DB client uses `DATABASE_URL_TEST`.

