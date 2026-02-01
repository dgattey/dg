import { writeFile } from 'node:fs/promises';
import { dotenvLoad } from 'dotenv-mono';
import {
  buildClientSchema,
  getIntrospectionQuery,
  type IntrospectionQuery,
  printSchema,
} from 'graphql';

// ─────────────────────────────────────────────────────────────────────────────
// Type guards
// ─────────────────────────────────────────────────────────────────────────────

type JsonObject = Record<string, unknown>;

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null;

const isIntrospectionResult = (value: unknown): value is IntrospectionQuery =>
  isJsonObject(value) && isJsonObject(value.__schema);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Reads required environment variables or throws */
function getContentfulConfig() {
  dotenvLoad();
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

  if (!spaceId || !accessToken) {
    const missing = [
      !spaceId && 'CONTENTFUL_SPACE_ID',
      !accessToken && 'CONTENTFUL_ACCESS_TOKEN',
    ].filter(Boolean);
    throw new Error(`Missing env vars for schema introspection: ${missing.join(', ')}`);
  }

  return { accessToken, spaceId };
}

/** Fetches the introspection result from Contentful's GraphQL API */
async function fetchIntrospection(spaceId: string, accessToken: string) {
  const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}`;

  const response = await fetch(endpoint, {
    body: JSON.stringify({ query: getIntrospectionQuery() }),
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch schema: ${response.status} ${response.statusText}\n${body}`);
  }

  return response.json() as Promise<unknown>;
}

/** Validates the introspection payload and extracts the data */
function parseIntrospectionPayload(payload: unknown): IntrospectionQuery {
  if (!isJsonObject(payload)) {
    throw new Error('Schema introspection returned invalid JSON.');
  }

  // Check for GraphQL errors in the response
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    const messages = payload.errors
      .map((err) => (isJsonObject(err) ? err.message : null))
      .filter((msg): msg is string => typeof msg === 'string');
    throw new Error(`Schema introspection failed:\n${messages.join('\n')}`);
  }

  if (!isIntrospectionResult(payload.data)) {
    throw new Error('Schema introspection returned no data.');
  }

  return payload.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const { spaceId, accessToken } = getContentfulConfig();
const payload = await fetchIntrospection(spaceId, accessToken);
const introspection = parseIntrospectionPayload(payload);

const schema = buildClientSchema(introspection);
const schemaText = `${printSchema(schema)}\n`;
const outputPath = new URL('../contentful/schema.graphql', import.meta.url);

await writeFile(outputPath, schemaText, 'utf8');
