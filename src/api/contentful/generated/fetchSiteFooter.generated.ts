import type * as Types from './api.generated';

export type SiteFooterQueryVariables = Types.Exact<{ [key: string]: never }>;

export type SiteFooterQuery = {
  readonly sectionCollection:
    | {
        readonly items: ReadonlyArray<
          | {
              readonly blocksCollection:
                | {
                    readonly items: ReadonlyArray<
                      | { readonly title: string | undefined; readonly url: string | undefined }
                      | {
                          readonly blocksCollection:
                            | {
                                readonly items: ReadonlyArray<
                                  | {
                                      readonly title: string | undefined;
                                      readonly url: string | undefined;
                                      readonly icon: string | undefined;
                                    }
                                  | {}
                                  | undefined
                                >;
                              }
                            | undefined;
                        }
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
