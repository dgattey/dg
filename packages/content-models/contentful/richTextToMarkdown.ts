import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import { isNotNullish, isRecord } from '@dg/shared-core/types/typeguards';
import type { RenderableAssetWithSys } from './renderables/assets';
import type { RenderableEntry } from './renderables/richText';
import { isRichTextDocument, type RenderableRichTextContent } from './renderables/richText';

type RichTextNode = {
  nodeType: string;
  value?: string;
  marks?: Array<{ type: string }>;
  data?: unknown;
  content?: Array<RichTextNode>;
};

type EntryLookup = Map<string, RenderableEntry>;
type AssetLookup = Map<string, RenderableAssetWithSys>;

const isRichTextNode = (value: unknown): value is RichTextNode =>
  isRecord(value) && typeof value.nodeType === 'string';

const getTargetId = (data: unknown): string | null => {
  if (!isRecord(data) || !isRecord(data.target) || !isRecord(data.target.sys)) {
    return null;
  }
  return typeof data.target.sys.id === 'string' ? data.target.sys.id : null;
};

const getHyperlinkUri = (data: unknown): string | null => {
  if (!isRecord(data) || typeof data.uri !== 'string') {
    return null;
  }
  return data.uri;
};

const applyMarks = (text: string, marks: Array<{ type: string }> | undefined): string => {
  if (!marks?.length) {
    return text;
  }
  return marks.reduce((value, mark) => {
    if (mark.type === MARKS.BOLD) {
      return `**${value}**`;
    }
    if (mark.type === MARKS.ITALIC) {
      return `*${value}*`;
    }
    if (mark.type === MARKS.CODE) {
      return `\`${value}\``;
    }
    return value;
  }, text);
};

const renderInline = (node: RichTextNode, entries: EntryLookup): string => {
  switch (node.nodeType) {
    case 'text':
      return applyMarks(node.value ?? '', node.marks);
    case INLINES.HYPERLINK: {
      const href = getHyperlinkUri(node.data);
      const label = (node.content ?? []).map((child) => renderInline(child, entries)).join('');
      return href ? `[${label}](${href})` : label;
    }
    case INLINES.EMBEDDED_ENTRY: {
      const id = getTargetId(node.data);
      const entry = id ? entries.get(id) : undefined;
      if (!entry) {
        return '';
      }
      if ('thumbnail' in entry) {
        return entry.link ? `[${entry.title}](${entry.link.url})` : entry.title;
      }
      return `[${entry.title}](${entry.url})`;
    }
    default:
      return (node.content ?? []).map((child) => renderInline(child, entries)).join('');
  }
};

const renderBlock = (
  node: RichTextNode,
  entries: EntryLookup,
  assets: AssetLookup,
): string | null => {
  const inline = () => (node.content ?? []).map((child) => renderInline(child, entries)).join('');

  switch (node.nodeType) {
    case BLOCKS.PARAGRAPH: {
      const text = inline().trim();
      return text || null;
    }
    case BLOCKS.HEADING_1:
      return `# ${inline().trim()}`;
    case BLOCKS.HEADING_2:
      return `## ${inline().trim()}`;
    case BLOCKS.HEADING_3:
      return `### ${inline().trim()}`;
    case BLOCKS.HEADING_4:
      return `#### ${inline().trim()}`;
    case BLOCKS.HEADING_5:
      return `##### ${inline().trim()}`;
    case BLOCKS.HEADING_6:
      return `###### ${inline().trim()}`;
    case BLOCKS.HR:
      return '---';
    case BLOCKS.UL_LIST: {
      const items = (node.content ?? [])
        .map((item) => {
          if (item.nodeType !== BLOCKS.LIST_ITEM) {
            return null;
          }
          const text = (item.content ?? [])
            .map((child) => renderBlock(child, entries, assets))
            .filter(isNotNullish)
            .join(' ')
            .trim();
          return text ? `- ${text}` : null;
        })
        .filter(isNotNullish);
      return items.length > 0 ? items.join('\n') : null;
    }
    case BLOCKS.OL_LIST: {
      const items = (node.content ?? [])
        .map((item, index) => {
          if (item.nodeType !== BLOCKS.LIST_ITEM) {
            return null;
          }
          const text = (item.content ?? [])
            .map((child) => renderBlock(child, entries, assets))
            .filter(isNotNullish)
            .join(' ')
            .trim();
          return text ? `${index + 1}. ${text}` : null;
        })
        .filter(isNotNullish);
      return items.length > 0 ? items.join('\n') : null;
    }
    case BLOCKS.QUOTE: {
      const text = (node.content ?? [])
        .map((child) => renderBlock(child, entries, assets))
        .filter(isNotNullish)
        .join('\n')
        .trim();
      return text
        ? text
            .split('\n')
            .map((line) => `> ${line}`)
            .join('\n')
        : null;
    }
    case BLOCKS.EMBEDDED_ENTRY: {
      const id = getTargetId(node.data);
      const entry = id ? entries.get(id) : undefined;
      if (!entry) {
        return null;
      }
      if ('thumbnail' in entry) {
        return entry.link ? `[${entry.title}](${entry.link.url})` : entry.title;
      }
      return `[${entry.title}](${entry.url})`;
    }
    case BLOCKS.EMBEDDED_ASSET: {
      const id = getTargetId(node.data);
      const asset = id ? assets.get(id) : undefined;
      if (!asset) {
        return null;
      }
      const alt = asset.title ?? 'Image';
      return `![${alt}](${asset.url})`;
    }
    default: {
      const nested = (node.content ?? [])
        .map((child) => renderBlock(child, entries, assets))
        .filter(isNotNullish);
      return nested.length > 0 ? nested.join('\n\n') : null;
    }
  }
};

/**
 * Converts Contentful rich text into clean Markdown for LLM/agent consumption.
 */
export function richTextToMarkdown(content: RenderableRichTextContent): string {
  if (!isRichTextDocument(content.json)) {
    return '';
  }

  const entries = new Map<string, RenderableEntry>();
  for (const entry of [...content.links.entries.block, ...content.links.entries.inline]) {
    entries.set(entry.sys.id, entry);
  }

  const assets = new Map<string, RenderableAssetWithSys>();
  for (const asset of content.links.assets.block) {
    assets.set(asset.sys.id, asset);
  }

  const blocks = content.json.content
    .filter(isRichTextNode)
    .map((node) => renderBlock(node, entries, assets))
    .filter(isNotNullish);

  return blocks.join('\n\n').trim();
}
