import 'server-only';

import {
  type RenderableChangelogSnapshot,
  toRenderableChangelogSnapshot,
} from '@dg/content-models/contentful/renderables/changelogSnapshots';
import { changelogSnapshotsResponseSchema } from '@dg/content-models/contentful/schema/changelogSnapshots';
import { gql } from 'graphql-request';
import { parseResponse } from '../clients/parseResponse';
import { getContentfulClient } from './contentfulClient';

const QUERY = gql`
  query ChangelogSnapshots {
    assetCollection(where: { fileName_contains: "changelog-v" }, order: fileName_ASC, limit: 50) {
      items {
        fileName
        title
        url(transform: { quality: 90, format: WEBP, width: 1200 })
        width
        height
      }
    }
  }
`;

export async function fetchChangelogSnapshots(): Promise<
  ReadonlyMap<string, RenderableChangelogSnapshot>
> {
  const data = parseResponse(
    changelogSnapshotsResponseSchema,
    await getContentfulClient().request(QUERY),
    { kind: 'graphql', source: 'contentful.fetchChangelogSnapshots' },
  );
  const snapshots = new Map<string, RenderableChangelogSnapshot>();
  for (const item of data.assetCollection?.items ?? []) {
    const snapshot = toRenderableChangelogSnapshot(item);
    if (snapshot) {
      snapshots.set(snapshot.tag, snapshot);
    }
  }
  return snapshots;
}
