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

- `turbo connect -- <branch>` - Connect to a Neon branch
- `turbo db -- db:migrate` - Run pending migrations
- `turbo db -- db:migrate:undo` - Rollback last migration
- `turbo db -- migration:generate --name <name>` - Create new migration

Requires `neonctl` installed globally.
