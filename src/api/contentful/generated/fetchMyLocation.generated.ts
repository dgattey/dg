import type * as Types from './api.generated';

export type MyLocationQueryVariables = Types.Exact<{ [key: string]: never }>;

export type MyLocationQuery = {
  readonly contentTypeLocation:
    | {
        readonly initialZoom: number | undefined;
        readonly zoomLevels: ReadonlyArray<string | undefined> | undefined;
        readonly point:
          | { readonly lat: number | undefined; readonly lon: number | undefined }
          | undefined;
        readonly image:
          | {
              readonly url: string | undefined;
              readonly width: number | undefined;
              readonly height: number | undefined;
            }
          | undefined;
      }
    | undefined;
};
