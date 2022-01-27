import type * as Types from './contentfulApi.generated';

export type HeaderQueryVariables = Types.Exact<{ [key: string]: never }>;

export type HeaderQuery = {
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
