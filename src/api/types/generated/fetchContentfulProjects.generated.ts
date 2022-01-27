import type * as Types from './contentfulApi.generated';

export type ProjectsQueryVariables = Types.Exact<{ [key: string]: never }>;

export type ProjectsQuery = {
  readonly projectCollection:
    | {
        readonly items: ReadonlyArray<
          | {
              readonly title: string | undefined;
              readonly creationDate: any | undefined;
              readonly type: ReadonlyArray<string | undefined> | undefined;
              readonly layout: string | undefined;
              readonly link: { readonly url: string | undefined } | undefined;
              readonly thumbnail:
                | {
                    readonly url: string | undefined;
                    readonly width: number | undefined;
                    readonly height: number | undefined;
                  }
                | undefined;
              readonly description: { readonly json: any } | undefined;
            }
          | undefined
        >;
      }
    | undefined;
};
