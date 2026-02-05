import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { log } from '@dg/shared-core/logging/log';
import type { Sequelize } from 'sequelize-typescript';

/**
 * Runs all pending migrations on the database.
 */
export async function runMigrations(dbClient: Sequelize): Promise<void> {
  const Sequelize = await import('sequelize');
  const queryInterface = dbClient.getQueryInterface();

  // Create SequelizeMeta table if it doesn't exist
  await queryInterface.createTable(
    'SequelizeMeta',
    {
      name: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.STRING,
      },
    },
    { ifNotExists: true } as Parameters<typeof queryInterface.createTable>[2],
  );

  // Get already-run migrations
  const [executedMigrations] = (await dbClient.query(
    'SELECT name FROM "SequelizeMeta"',
  )) as unknown as [[{ name: string }]];
  const executedNames = new Set(executedMigrations.map((m) => m.name));

  // Find migration files (in @dg/db/migrations)
  const dbPackagePath = require.resolve('@dg/db');
  const migrationsDir = join(dbPackagePath, '..', 'migrations');
  const migrationFiles = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.js'))
    .sort();

  // Run pending migrations
  for (const file of migrationFiles) {
    if (executedNames.has(file)) continue;

    log.info(`Running migration: ${file}`);
    const migrationPath = join(migrationsDir, file);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const migration = require(migrationPath) as {
      up: (qi: typeof queryInterface, Seq: typeof Sequelize) => Promise<void>;
    };
    await migration.up(queryInterface, Sequelize);
    await dbClient.query('INSERT INTO "SequelizeMeta" (name) VALUES (?)', {
      replacements: [file],
    });
  }
}
