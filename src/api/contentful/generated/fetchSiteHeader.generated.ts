import type * as Types from './api.generated';

export type SiteHeaderQueryVariables = Types.Exact<{ [key: string]: never }>;

export type SiteHeaderQuery = {
  readonly sectionCollection:
    | {
        readonly items: ReadonlyArray<
          | {
              readonly blocksCollection:
                | {
                    readonly items: ReadonlyArray<
                      | { readonly title: string | undefined; readonly url: string | undefined }
                      | {}
                      | undefined
                    >;
                  }
                | undefined;
            }
          | undefined
        >;
      }
    | undefined;
};
