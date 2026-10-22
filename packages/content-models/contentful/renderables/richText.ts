import type { Document } from '@contentful/rich-text-types';
import { isNotNullish, isRecord } from '@dg/shared-core/types/typeguards';
import type { RichTextContent } from '../schema/shared';
import type { RenderableAssetWithSys } from './assets';
import { toRenderableAssetWithSys } from './assets';
import type { RenderableLinkWithSys } from './links';
import { toRenderableLinkWithSys } from './links';

export type RenderableEntry = RenderableLinkWithSys;

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
        block: entryBlocks.map(toRenderableLinkWithSys).filter(isNotNullish),
        inline: entryInline.map(toRenderableLinkWithSys).filter(isNotNullish),
      },
    },
  };
};
