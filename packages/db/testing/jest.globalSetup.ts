import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { log } from '@dg/shared-core/logging/log';
import 'dotenv-mono/load';
import type { Sequelize } from 'sequelize-typescript';

async function runMigrations(dbClient: Sequelize): Promise<void> {
  const Sequelize = await import('sequelize');
  const queryInterface = dbClient.getQueryInterface();

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

  const [executedMigrations] = (await dbClient.query(
    'SELECT name FROM "SequelizeMeta"',
  )) as unknown as [[{ name: string }]];
  const executedNames = new Set(executedMigrations.map((m) => m.name));

  const migrationsDir = join(__dirname, '..', 'migrations');
  const migrationFiles = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.js'))
    .sort();

  for (const file of migrationFiles) {
    if (executedNames.has(file)) continue;

    log.info(`Running migration: ${file}`);
    const migrationPath = join(migrationsDir, file);
    const migration = require(migrationPath) as {
      up: (qi: typeof queryInterface, Seq: typeof Sequelize) => Promise<void>;
    };
    await migration.up(queryInterface, Sequelize);
    await dbClient.query('INSERT INTO "SequelizeMeta" (name) VALUES (?)', {
      replacements: [file],
    });
  }
}

/**
 * Global setup for Jest tests.
 * Sets up the test database with migrations and resets all tables.
 * Fails loudly if DATABASE_URL_TEST is not set.
 *
 * Note: This runs in a separate process from tests. Database connections
 * opened here are closed at the end of this function. Test workers open
 * their own connections which are closed by setupTestDatabase afterAll.
 */
export default async function globalSetup() {
  const { closeDbConnection, dbClient } = await import('../client');

  await runMigrations(dbClient);
  await dbClient.truncate({ cascade: true });
  await closeDbConnection();
}
