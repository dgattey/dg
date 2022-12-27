// eslint-disable-next-line import/no-extraneous-dependencies
import { CodegenConfig } from '@graphql-codegen/cli';

require('dotenv').config();

// Where all our documents to parse live by default
const BASE_FOLDER = 'src/api/server';

// Relative to BASE_FOLDER, where our generated files live
const GENERATED_FOLDER = '../types/generated';

// Standard options for the files generated from operations or the main api file
const SHARED_CONFIG = {
  avoidOptionals: true,
  immutableTypes: true,
  skipTypename: true,
  useTypeImports: true,
  maybeValue: 'T | undefined',
};

// Standard options for the *api.generated.ts files
const API_CONFIG = {
  ...SHARED_CONFIG,
  constEnums: true,
  enumsAsTypes: true,
  defaultScalarType: 'unknown',
};

/**
 * Hi! Complicated file, read me to understand! This creates generators for
 * @graphql-codegen so we can have nice types for the APIs we use and the queries/
 * mutations we write.
 *
 * This function creates two generators for a given API configuration. One is for
 * a main shared "xApi.generated.ts" file. The other generator creates one file
 * per file that has operations in it, with types for each operation. The resulting
 * object from this function is spread into the `generates` key in the options below.
 *
 * You'll notice that every API has the same configuration except for the name,
 * scalars, and endpoint/authorization. That's intentional!
 */
const createApiGenerator = (
  name: string,
  {
    schemaEndpoint,
    token,
    scalars,
    onlyOperationTypes,
  }: {
    schemaEndpoint: string;
    token: string;
    scalars: Record<string, unknown>;
    onlyOperationTypes: boolean;
  },
): CodegenConfig['generates'] => {
  const documents = `${BASE_FOLDER}/${name}/*.ts`;
  const baseTypesPath = `${GENERATED_FOLDER}/${name}Api.generated.ts`;
  const schemas = [
    {
      [schemaEndpoint]: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  ];

  return {
    // Creates the main `${name}Api.generated.ts` file
    [`${BASE_FOLDER}/${baseTypesPath}`]: {
      documents,
      schema: schemas,
      plugins: ['typescript'],
      config: {
        ...API_CONFIG,
        onlyOperationTypes,
        scalars,
      },
    },

    // Creates individual `.generated.ts` files for each .ts file that has operations
    [`${BASE_FOLDER}/${name}/`]: {
      documents,
      schema: schemas,
      plugins: ['typescript-operations'],
      preset: 'near-operation-file',
      presetConfig: {
        baseTypesPath: `../${baseTypesPath}`,
        folder: `../${GENERATED_FOLDER}`,
      },
      config: {
        ...SHARED_CONFIG,
        preResolveTypes: true,
      },
    },
  };
};

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

export default config;
