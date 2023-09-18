import type * as Types from './contentfulApi.generated';

export type FooterQueryVariables = Types.Exact<{ [key: string]: never }>;

export type FooterQuery = {
  readonly sectionCollection:
    | {
        readonly items: ReadonlyArray<
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
          | undefined
        >;
      }
    | undefined;
};
