const config = {
  projects: {
    contentful: {
      documents: ['./packages/services/contentful/**/*.ts'],
      schema: './packages/content-models/contentful/schema.graphql',
    },
  },
};

export default config;
