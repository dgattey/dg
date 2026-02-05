import type { Options } from '@contentful/rich-text-react-renderer';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import type { NodeData } from '@contentful/rich-text-types';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import type { RenderableAssetWithSys } from '@dg/content-models/contentful/renderables/assets';
import type { RenderableProjectWithSys } from '@dg/content-models/contentful/renderables/projects';
import {
  isRichTextDocument,
  type RenderableEntry,
  type RenderableRichTextContent,
} from '@dg/content-models/contentful/renderables/richText';
import { isRecord } from '@dg/shared-core/types/typeguards';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { PROJECT_MAX_IMAGE_DIMENSION } from '@dg/ui/helpers/imageSizes';
import type { SxObject, SxProps } from '@dg/ui/theme';
import { Divider, Stack, Typography } from '@mui/material';
import { ProjectCard } from './homepage/ProjectCard';

type RichTextProps = RenderableRichTextContent & {
  sx?: SxProps;
};

/**
 * Defines a Node's Data with actual data
 */
type DataWithId = {
  target: {
    sys: {
      /**
       * UUID for the value
       */
      id: string;
    };
  };
};

/**
 * Offsets for fixed header so anchor links look right
 */
const HEADING_SX: SxObject = {
  marginBottom: 3,
  marginTop: -12,
  paddingTop: 12,
};

const paragraphSx: SxObject = {
  marginBottom: 3.5,
};

/**
 * Typeguard for converting the `any` to a structured object
 */
const isDataWithId = (data: NodeData): data is DataWithId =>
  isRecord(data) &&
  isRecord(data.target) &&
  isRecord(data.target.sys) &&
  typeof data.target.sys.id === 'string';

/**
 * Typeguard for converting the `any` to a structured link
 */
const isDataWithLink = (data: NodeData): data is { uri: string } =>
  isRecord(data) && typeof data.uri === 'string';

const isRenderableProjectEntry = (entry: RenderableEntry): entry is RenderableProjectWithSys =>
  'thumbnail' in entry;

/**
 * Creates an element for a single entry in our rich text
 */
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
  if (isRenderableProjectEntry(entry)) {
    return <ProjectCard {...entry} />;
  }
  return <Link href={entry.url} icon={entry.icon ?? undefined} title={entry.title} />;
}

/**
 * Renders a singular asset element from data in the rich text
 */
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
        // We don't have any images to test this with, but it should be big enough for most cases...
        extraLarge: PROJECT_MAX_IMAGE_DIMENSION,
      }}
      url={asset.url}
      width={asset.width}
    />
  );
}

/**
 * Converts children to an id for use with anchor links
 */
function HeadingWithId({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
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
    <Typography id={id} sx={HEADING_SX} variant={variant}>
      {children}
    </Typography>
  );
}

/**
 * Takes links and converts them into rich text through rendering specific types of content.
 */
const renderOptions = (links: RichTextProps['links']): Options => {
  // Map the assets - we only need the sys.id for mapping, and we'll cast as Asset for rendering
  const assetMap = new Map<string, RenderableAssetWithSys>();
  links.assets.block.forEach((asset) => {
    assetMap.set(asset.sys.id, asset);
  });

  // Map the inline and block entries
  const entryMap = new Map<string, RenderableEntry>();
  [...links.entries.block, ...links.entries.inline].forEach((entry) => {
    entryMap.set(entry.sys.id, entry);
  });

  return {
    renderNode: {
      [BLOCKS.HEADING_1]: (_, children) => <HeadingWithId variant="h1">{children}</HeadingWithId>,
      [BLOCKS.HEADING_2]: (_, children) => <HeadingWithId variant="h2">{children}</HeadingWithId>,
      [BLOCKS.HEADING_3]: (_, children) => <HeadingWithId variant="h3">{children}</HeadingWithId>,
      [BLOCKS.HEADING_4]: (_, children) => <HeadingWithId variant="h4">{children}</HeadingWithId>,
      [BLOCKS.HEADING_5]: (_, children) => <HeadingWithId variant="h5">{children}</HeadingWithId>,
      [BLOCKS.HEADING_6]: (_, children) => <HeadingWithId variant="h6">{children}</HeadingWithId>,
      [BLOCKS.PARAGRAPH]: (_, children) => (
        <Typography sx={paragraphSx} variant="body1">
          {children}
        </Typography>
      ),
      [BLOCKS.HR]: () => <Divider />,
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

/**
 * Complicated component to render rich text from Contentful's rich
 * text renderer, resolving all items to components
 */
export function RichText({ json, links, sx }: RichTextProps) {
  if (!isRichTextDocument(json)) {
    return null;
  }
  return <Stack sx={sx}>{documentToReactComponents(json, renderOptions(links))}</Stack>;
}
