import type { Document } from '@contentful/rich-text-types';
import { isNotNullish, isRecord } from '@dg/shared-core/helpers/typeguards';
import type { Entry, RichTextContent } from '../schema/shared';
import type { RenderableAssetWithSys } from './assets';
import { toRenderableAssetWithSys } from './assets';
import type { RenderableLinkWithSys } from './links';
import { toRenderableLinkWithSys } from './links';
import type { RenderableProjectWithSys } from './projects';
import { toRenderableProjectWithSys } from './projects';

export type RenderableEntry = RenderableLinkWithSys | RenderableProjectWithSys;

export type RenderableRichTextContent = {
  json: unknown;
  links: {
    assets: {
      block: Array<RenderableAssetWithSys>;
    };
    entries: {
      block: Array<RenderableEntry>;
      inline: Array<RenderableEntry>;
    };
  };
};

export const isRichTextDocument = (value: unknown): value is Document =>
  isRecord(value) && value.nodeType === 'document' && Array.isArray(value.content);

const toRenderableEntry = (entry: Entry | null | undefined): RenderableEntry | null => {
  if (!entry) {
    return null;
  }
  if ('thumbnail' in entry) {
    return toRenderableProjectWithSys(entry);
  }
  return toRenderableLinkWithSys(entry);
};

export const toRenderableRichTextContent = (
  content: RichTextContent,
): RenderableRichTextContent => {
  const assetBlocks = content.links?.assets?.block ?? [];
  const entryBlocks = content.links?.entries?.block ?? [];
  const entryInline = content.links?.entries?.inline ?? [];

  return {
    json: content.json,
    links: {
      assets: {
        block: assetBlocks.map(toRenderableAssetWithSys).filter(isNotNullish),
      },
      entries: {
        block: entryBlocks.map(toRenderableEntry).filter(isNotNullish),
        inline: entryInline.map(toRenderableEntry).filter(isNotNullish),
      },
    },
  };
};
