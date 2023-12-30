import type { CodegenConfig } from '@graphql-codegen/cli';
import { dotenvLoad } from 'dotenv-mono';
import { createApiGenerator } from './createApiGenerator';

dotenvLoad();

// For the Contentful API
const contentfulGenerators = createApiGenerator('contentful', {
  schemaEndpoint: `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
  token: process.env.CONTENTFUL_ACCESS_TOKEN ?? '',
  onlyOperationTypes: false,
  scalars: {
    DateTime: 'string',
    Dimension: 'number',
    HexColor: 'string',
    JSON: '{ nodeType: string, data: Record<string, unknown> | undefined, value: string | undefined, content: Array<{ nodeType: string, data: Record<string, unknown> | undefined, value: string | undefined, content: Array<{ nodeType: string, data: Record<string, unknown> | undefined, value: string | undefined, content: Array<{ nodeType: string, data: Record<string, unknown> | undefined, value: string | undefined, content: Array<{ nodeType: string, data: Record<string, unknown> | undefined, value: string | undefined, content: Array<unknown> | undefined }> | undefined }> | undefined }> | undefined }> | undefined }',
    Quality: 'number',
  },
});

// For the Github API
const githubGenerators = createApiGenerator('github', {
  schemaEndpoint: 'https://api.github.com/graphql',
  token: process.env.GITHUB_AUTHENTICATION_TOKEN ?? '',
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
});

/**
 * These are all the options for codegen itself. We format with
 * prettier after running generation for Contentful and Github,
 * and overwrite existing files.
 */
const config: CodegenConfig = {
  overwrite: true,
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
  generates: {
    ...contentfulGenerators,
    ...githubGenerators,
  },
};

// We export as default so we can actually use it in a script
// eslint-disable-next-line import/no-default-export
export default config;
