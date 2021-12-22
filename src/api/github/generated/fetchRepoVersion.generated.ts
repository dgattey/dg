import type * as Types from './api.generated';

export type DgRepoLatestReleaseQueryVariables = Types.Exact<{ [key: string]: never }>;

export type DgRepoLatestReleaseQuery = {
  readonly repository:
    | { readonly latestRelease: { readonly name: string | undefined } | undefined }
    | undefined;
};
