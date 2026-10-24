import type { Asset } from '../schema/shared';

const CHANGELOG_SNAPSHOT_FILE = /^changelog-(v\d+\.\d+\.\d+)\.(?:png|jpe?g|webp)$/i;

export type RenderableChangelogSnapshot = {
  height: number;
  tag: string;
  title: string | null;
  url: string;
  width: number;
};

export function parseChangelogSnapshotTag(fileName: string | null | undefined): string | null {
  const tag = CHANGELOG_SNAPSHOT_FILE.exec(fileName?.trim() ?? '')?.[1];
  return tag ? tag.toLowerCase() : null;
}

function isPositiveDimension(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function toRenderableChangelogSnapshot(
  asset: Asset | null | undefined,
): RenderableChangelogSnapshot | null {
  if (!asset) {
    return null;
  }
  const tag = parseChangelogSnapshotTag(asset.fileName);
  const url = asset.url?.trim() ?? '';
  const { height, width } = asset;
  if (!tag || !url || !isPositiveDimension(width) || !isPositiveDimension(height)) {
    return null;
  }
  const rawTitle = asset.title?.trim() ?? '';
  return {
    height,
    tag,
    title: rawTitle && rawTitle.toLowerCase() !== tag ? rawTitle : null,
    url,
    width,
  };
}
