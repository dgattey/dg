import type * as Types from './githubApi.generated';

export type GithubRepoVersionQueryVariables = Types.Exact<{ [key: string]: never }>;

export type GithubRepoVersionQuery = {
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
