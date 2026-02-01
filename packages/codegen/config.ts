import { invariant } from '@dg/shared-core/helpers/invariant';
import type { CodegenConfig } from '@graphql-codegen/cli';
import { dotenvLoad } from 'dotenv-mono';
import { createApiGenerator } from './createApiGenerator';

dotenvLoad();

const { CONTENTFUL_ACCESS_TOKEN, CONTENTFUL_SPACE_ID } = process.env;
invariant(CONTENTFUL_ACCESS_TOKEN, 'Missing CONTENTFUL_ACCESS_TOKEN env variable');
invariant(CONTENTFUL_SPACE_ID, 'Missing CONTENTFUL_SPACE_ID env variable');

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

/**
 * These are all the options for codegen itself. We format with
 * biome after running generation for Contentful,
 * and overwrite existing files.
 */
const config: CodegenConfig = {
  generates: {
    ...contentfulGenerators,
  },
  hooks: {
    afterAllFileWrite: ['biome check --write'],
  },
  overwrite: true,
};

// We export as default so we can actually use it in a script
export default config;
