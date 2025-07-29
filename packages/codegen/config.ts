import type { CodegenConfig } from '@graphql-codegen/cli';
import { dotenvLoad } from 'dotenv-mono';
import { invariant } from 'shared-core/helpers/invariant';
import { createApiGenerator } from './createApiGenerator';

dotenvLoad();

const { CONTENTFUL_ACCESS_TOKEN, CONTENTFUL_SPACE_ID, GITHUB_AUTHENTICATION_TOKEN } = process.env;
invariant(CONTENTFUL_ACCESS_TOKEN, 'Missing CONTENTFUL_ACCESS_TOKEN env variable');
invariant(CONTENTFUL_SPACE_ID, 'Missing CONTENTFUL_SPACE_ID env variable');
invariant(GITHUB_AUTHENTICATION_TOKEN, 'Missing GITHUB_AUTHENTICATION_TOKEN env variable');

// For the Contentful API
const contentfulGenerators = createApiGenerator('contentful', {
  onlyOperationTypes: false,
  scalars: {
    DateTime: 'string',
    Dimension: 'number',
    HexColor: 'string',
    JSON: '{ nodeType: string, data: Record<string, unknown> | undefined, value: string | undefined, content: Array<{ nodeType: string, data: Record<string, unknown> | undefined, value: string | undefined, content: Array<{ nodeType: string, data: Record<string, unknown> | undefined, value: string | undefined, content: Array<{ nodeType: string, data: Record<string, unknown> | undefined, value: string | undefined, content: Array<{ nodeType: string, data: Record<string, unknown> | undefined, value: string | undefined, content: Array<unknown> | undefined }> | undefined }> | undefined }> | undefined }> | undefined }',
    Quality: 'number',
  },
  schemaEndpoint: `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}`,
  token: CONTENTFUL_ACCESS_TOKEN,
});

// For the Github API
const githubGenerators = createApiGenerator('github', {
  onlyOperationTypes: true,
  scalars: {
    Base64String: 'string',
    Date: 'string',
    DateTime: 'string',
    GitObjectID: 'string',
    GitSSHRemote: 'string',
    GitTimestamp: 'string',
    HTML: 'string',
    PreciseDateTime: 'string',
    URI: 'string',
    X509Certificate: 'string',
  },
  schemaEndpoint: 'https://api.github.com/graphql',
  token: GITHUB_AUTHENTICATION_TOKEN,
});

/**
 * These are all the options for codegen itself. We format with
 * biome after running generation for Contentful and Github,
 * and overwrite existing files.
 */
const config: CodegenConfig = {
  generates: {
    ...contentfulGenerators,
    ...githubGenerators,
  },
  hooks: {
    afterAllFileWrite: ['biome check --write'],
  },
  overwrite: true,
};

// We export as default so we can actually use it in a script
export default config;
