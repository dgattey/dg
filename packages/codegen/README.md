# Codegen

GraphQL type generation for external APIs.

## What It Generates

- `*.generated.ts` files in `packages/services/contentful/`
- TypeScript types from Contentful GraphQL schema
- Operation-specific types placed next to query files

## Usage

```bash
turbo codegen  # Regenerates all .generated.ts files
```

## Configuration

- `config.ts` - GraphQL Codegen configuration
- `createApiGenerator.ts` - Factory for creating API-specific generators
- Generated files are auto-formatted with Biome
