import type * as Types from './api.generated';

export type MyLocationQueryVariables = Types.Exact<{ [key: string]: never }>;

export type MyLocationQuery = {
  readonly contentTypeLocation:
    | {
        readonly point:
          | { readonly lat: number | undefined; readonly lon: number | undefined }
          | undefined;
      }
    | undefined;
};
