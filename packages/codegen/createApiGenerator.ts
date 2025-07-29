import path from 'node:path';
import type { CodegenConfig } from '@graphql-codegen/cli';

// Fun dance to pull out the union type for Schema
type Schema = Extract<CodegenConfig['generates'][string], { schema?: unknown }>['schema'];

// This is our root directory above packages/apps folder, needs to change if packages/codegen moves
const ROOT = __dirname.split('/').slice(0, -2).join('/');

// The generated api files are named this
const GENERATED_API_FILE_NAME = 'api.generated.ts';

// Standard options for the files generated from operations or the main api file
const SHARED_CONFIG = {
  avoidOptionals: true,
  immutableTypes: true,
  maybeValue: 'T | undefined',
  skipTypename: true,
  useTypeImports: true,
};

/**
 * Hi! Complicated file, read me to understand! This creates generators for
 * `@graphql-codegen` so we can have nice types for the APIs we use and the queries/
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
export function createApiGenerator(
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
): CodegenConfig['generates'] {
  // Absolute path for the API folder root
  const apiFolder = path.join(ROOT, `packages/api/${name}`);

  // A glob for all the source operation documents, relative to project root
  const sourceDocumentsGlob = `${apiFolder}/!(*.generated).ts`;

  // Adds extra headers for the endpoints to ensure we can authorize and we have a unique user agent
  const schema: Schema = {
    [schemaEndpoint]: {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'dylangattey.com',
      },
    },
  };

  return {
    // Creates the generated API file without any imports, just types
    [`${apiFolder}/${GENERATED_API_FILE_NAME}`]: {
      config: {
        ...SHARED_CONFIG,
        constEnums: true,
        defaultScalarType: 'unknown',
        enumsAsTypes: true,
        onlyOperationTypes,
        scalars,
      },
      documents: sourceDocumentsGlob,
      plugins: ['typescript'],
      schema,
    },

    // Creates individual `.generated.ts` files for each .ts file that has operations, right next to it
    [apiFolder]: {
      config: {
        ...SHARED_CONFIG,
        preResolveTypes: true,
      },
      documents: sourceDocumentsGlob,
      plugins: ['typescript-operations'],
      preset: 'near-operation-file',
      presetConfig: {
        // Relative to the location of all of these files (`apiFolder` right now). This creates an import statement for typescript
        baseTypesPath: GENERATED_API_FILE_NAME,
      },
      schema,
    },
  };
}
