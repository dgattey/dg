import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { log } from '@dg/shared-core/logging/log';
import 'dotenv-mono/load';
import type { Config } from 'jest';
import type { Sequelize } from 'sequelize-typescript';

type GlobalConfigWithPatterns = Config & {
  nonFlagArgs?: Array<string>;
  testPathPatterns?: { isMatch?: (path: string) => boolean };
};

function collectTestFiles(dir: string): Array<string> {
  const results: Array<string> = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.turbo') {
      continue;
    }
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTestFiles(fullPath));
    } else if (/\.test\.tsx?$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function matchesSelectedTests(filePath: string, globalConfig?: GlobalConfigWithPatterns): boolean {
  if (typeof globalConfig?.testPathPatterns?.isMatch === 'function') {
    return globalConfig.testPathPatterns.isMatch(filePath);
  }
  const patterns = globalConfig?.nonFlagArgs ?? [];
  if (patterns.length === 0) {
    return true;
  }
  return patterns.some((pattern) => new RegExp(pattern).test(filePath));
}

function selectedTestsUseDatabase(
  globalConfig?: GlobalConfigWithPatterns,
  projectConfig?: Config,
): boolean {
  const rootDir = projectConfig?.rootDir ?? globalConfig?.rootDir ?? process.cwd();
  const testFiles = collectTestFiles(rootDir).filter((file) =>
    matchesSelectedTests(file, globalConfig),
  );
  return testFiles.some((file) => readFileSync(file, 'utf8').includes('setupTestDatabase'));
}

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
    await dbClient.query(
      'INSERT INTO "SequelizeMeta" (name) VALUES (?) ON CONFLICT (name) DO NOTHING',
      {
        replacements: [file],
      },
    );
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
export default async function globalSetup(
  globalConfig?: GlobalConfigWithPatterns,
  projectConfig?: Config,
) {
  if (!selectedTestsUseDatabase(globalConfig, projectConfig)) {
    return;
  }
  const { closeDbConnection, dbClient } = await import('../client');

  await runMigrations(dbClient);
  await dbClient.truncate({ cascade: true });
  await closeDbConnection();
}
