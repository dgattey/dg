import type * as Types from './contentfulApi.generated';

export type IntroBlockQueryVariables = Types.Exact<{ [key: string]: never }>;

export type IntroBlockQuery = {
  readonly asset:
    | {
        readonly url: string | undefined;
        readonly width: number | undefined;
        readonly height: number | undefined;
        readonly title: string | undefined;
      }
    | undefined;
  readonly textBlockCollection:
    | {
        readonly items: ReadonlyArray<
          | {
              readonly content:
                | {
                    readonly json: any;
                    readonly links: {
                      readonly entries: {
                        readonly inline: ReadonlyArray<
                          | {
                              readonly title: string | undefined;
                              readonly url: string | undefined;
                              readonly icon: string | undefined;
                            }
                          | {}
                          | undefined
                        >;
                        readonly block: ReadonlyArray<
                          | {
                              readonly title: string | undefined;
                              readonly url: string | undefined;
                              readonly icon: string | undefined;
                            }
                          | {}
                          | undefined
                        >;
                      };
                      readonly assets: {
                        readonly block: ReadonlyArray<
                          | {
                              readonly url: string | undefined;
                              readonly title: string | undefined;
                              readonly width: number | undefined;
                              readonly height: number | undefined;
                              readonly description: string | undefined;
                              readonly sys: { readonly id: string };
                            }
                          | undefined
                        >;
                      };
                    };
                  }
                | undefined;
            }
          | undefined
        >;
      }
    | undefined;
};
