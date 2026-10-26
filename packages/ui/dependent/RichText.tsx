import type { Options } from '@contentful/rich-text-react-renderer';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import type { NodeData } from '@contentful/rich-text-types';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import type { RenderableAssetWithSys } from '@dg/content-models/contentful/renderables/assets';
import {
  isRichTextDocument,
  type RenderableEntry,
  type RenderableRichTextContent,
} from '@dg/content-models/contentful/renderables/richText';
import { isRecord } from '@dg/shared-core/types/typeguards';
import { Typography, type TypographyVariant } from '../core/Typography';
import { Image } from './Image';
import { Link } from './Link';

const PROJECT_MAX_IMAGE_DIMENSION = 330;

type DataWithId = {
  target: {
    sys: {
      id: string;
    };
  };
};

const isDataWithId = (data: NodeData): data is DataWithId =>
  isRecord(data) &&
  isRecord(data.target) &&
  isRecord(data.target.sys) &&
  typeof data.target.sys.id === 'string';

const isDataWithLink = (data: NodeData): data is { uri: string } =>
  isRecord(data) && typeof data.uri === 'string';

function EntryElement({
  data,
  entryMap,
}: {
  data: NodeData;
  entryMap: Map<string, RenderableEntry>;
}) {
  if (!isDataWithId(data)) {
    return null;
  }
  const entry = entryMap.get(data.target.sys.id);
  if (!entry) {
    return null;
  }
  return <Link href={entry.url} title={entry.title} />;
}

function AssetElement({
  data,
  assetMap,
}: {
  data: NodeData;
  assetMap: Map<string, RenderableAssetWithSys>;
}) {
  if (!isDataWithId(data)) {
    return null;
  }
  const asset = assetMap.get(data.target.sys.id);
  if (!asset) {
    return null;
  }
  return (
    <Image
      alt={asset.title ?? 'Image title'}
      height={asset.height}
      sizes={{
        extraLarge: PROJECT_MAX_IMAGE_DIMENSION,
      }}
      url={asset.url}
      width={asset.width}
    />
  );
}

function HeadingWithId({
  as,
  children,
  variant,
}: {
  as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
  variant: TypographyVariant;
}) {
  let id = '';
  if (typeof children === 'string') {
    id = children;
  }
  if (Array.isArray(children)) {
    id = children.map((child) => (typeof child === 'string' ? child : '')).join('');
  }
  id = id
    .toLowerCase()
    .replace(/[^a-z]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return (
    <Typography as={as} data-rich-heading="" id={id} variant={variant}>
      {children}
    </Typography>
  );
}

const renderOptions = (
  links: RenderableRichTextContent['links'],
  variant: TypographyVariant,
  mdVariant?: TypographyVariant,
): Options => {
  const assetMap = new Map<string, RenderableAssetWithSys>();
  links.assets.block.forEach((asset) => {
    assetMap.set(asset.sys.id, asset);
  });

  const entryMap = new Map<string, RenderableEntry>();
  [...links.entries.block, ...links.entries.inline].forEach((entry) => {
    entryMap.set(entry.sys.id, entry);
  });

  return {
    renderNode: {
      [BLOCKS.HEADING_1]: (_, children) => (
        <HeadingWithId as="h1" variant="display-page">
          {children}
        </HeadingWithId>
      ),
      [BLOCKS.HEADING_2]: (_, children) => (
        <HeadingWithId as="h2" variant="stat-md">
          {children}
        </HeadingWithId>
      ),
      [BLOCKS.HEADING_3]: (_, children) => (
        <HeadingWithId as="h3" variant="title-md">
          {children}
        </HeadingWithId>
      ),
      [BLOCKS.HEADING_4]: (_, children) => (
        <HeadingWithId as="h4" variant="label">
          {children}
        </HeadingWithId>
      ),
      [BLOCKS.HEADING_5]: (_, children) => (
        <HeadingWithId as="h5" variant="title-sm">
          {children}
        </HeadingWithId>
      ),
      [BLOCKS.HEADING_6]: (_, children) => (
        <HeadingWithId as="h6" variant="row-title">
          {children}
        </HeadingWithId>
      ),
      [BLOCKS.PARAGRAPH]: (_, children) => (
        <Typography data-rich-paragraph="" data-typography-md={mdVariant} variant={variant}>
          {children}
        </Typography>
      ),
      [BLOCKS.HR]: () => <hr data-rich-divider="" />,
      [INLINES.HYPERLINK]: ({ data }, children) => {
        if (!isDataWithLink(data)) {
          return children;
        }
        return <Link href={data.uri}>{children}</Link>;
      },
      [INLINES.EMBEDDED_ENTRY]: ({ data }) => <EntryElement data={data} entryMap={entryMap} />,
      [BLOCKS.EMBEDDED_ENTRY]: ({ data }) => <EntryElement data={data} entryMap={entryMap} />,
      [BLOCKS.EMBEDDED_ASSET]: ({ data }) => <AssetElement assetMap={assetMap} data={data} />,
    },
  };
};

export function RichText({
  json,
  links,
  mdVariant,
  variant = 'prose-lg',
}: RenderableRichTextContent & { mdVariant?: TypographyVariant; variant?: TypographyVariant }) {
  if (!isRichTextDocument(json)) {
    return null;
  }
  return (
    <div data-rich-text="">
      {documentToReactComponents(json, renderOptions(links, variant, mdVariant))}
    </div>
  );
}
