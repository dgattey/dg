import type * as Types from './api.generated';

export type DgRepoLatestReleaseQueryVariables = Types.Exact<{ [key: string]: never }>;

export type DgRepoLatestReleaseQuery = {
  readonly repository:
    | {
        readonly releases: {
          readonly nodes:
            | ReadonlyArray<
                | {
                    readonly name: string | undefined;
                    readonly tagCommit: { readonly oid: any } | undefined;
                  }
                | undefined
              >
            | undefined;
        };
      }
    | undefined;
};
