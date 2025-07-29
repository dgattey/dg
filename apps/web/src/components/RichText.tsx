import type { Options } from '@contentful/rich-text-react-renderer';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import type { Document, NodeData } from '@contentful/rich-text-types';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { Divider, Stack, Typography } from '@mui/material';
import type { Asset, Entry, TextBlockContent } from 'api/contentful/api.generated';
import { isLink, isProject } from 'api/contentful/parsers';
import { isNotNullish } from 'shared-core/helpers/typeguards';
import { Image } from 'ui/dependent/Image';
import { Link } from 'ui/dependent/Link';
import { PROJECT_MAX_IMAGE_DIMENSION } from 'ui/helpers/imageSizes';
import type { SxProps } from 'ui/theme';
import { ProjectCard } from './homepage/ProjectCard';

type RichTextProps = TextBlockContent & {
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
const HEADING_SX: SxProps = {
  marginBottom: (theme) => theme.spacing(3),
  marginTop: -12,
  paddingTop: 12,
};

/**
 * Typeguard for converting the `any` to a structured object
 */
const isDataWithId = (data: NodeData): data is DataWithId =>
  Boolean((data as DataWithId).target.sys.id);

/**
 * Typeguard for converting the `any` to a structured link
 */
const isDataWithLink = (data: NodeData): data is { uri: string } =>
  Boolean((data as { uri: string }).uri);

/**
 * Creates an element for a single entry in our rich text
 */
function EntryElement({ data, entryMap }: { data: NodeData; entryMap: Map<string, Entry> }) {
  if (!isDataWithId(data)) {
    return null;
  }
  const entry = entryMap.get(data.target.sys.id);

  if (isLink(entry)) {
    return <Link {...entry} href={entry.url} />;
  }
  if (isProject(entry)) {
    return <ProjectCard {...entry} />;
  }

  return null;
}

/**
 * Renders a singular asset element from data in the rich text
 */
function AssetElement({ data, assetMap }: { data: NodeData; assetMap: Map<string, Asset> }) {
  if (!isDataWithId(data)) {
    return null;
  }
  const asset = assetMap.get(data.target.sys.id);
  return asset ? (
    <Image
      {...asset}
      alt={asset.title ?? 'Image title'}
      sizes={{
        // We don't have any images to test this with, but it should be big enough for most cases...
        extraLarge: PROJECT_MAX_IMAGE_DIMENSION,
      }}
    />
  ) : null;
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
const renderOptions = (links: TextBlockContent['links']): Options => {
  // Map the assets
  const assetMap = new Map<string, Asset>();
  links.assets.block.filter(isNotNullish).forEach((asset) => assetMap.set(asset.sys.id, asset));

  // Map the inline and block entries
  const entryMap = new Map<string, Entry>();
  [...links.entries.block, ...links.entries.inline]
    .filter(isNotNullish)
    .forEach((entry) => entryMap.set(entry.sys.id, entry));

  return {
    renderNode: {
      [BLOCKS.HEADING_1]: (_, children) => <HeadingWithId variant="h1">{children}</HeadingWithId>,
      [BLOCKS.HEADING_2]: (_, children) => <HeadingWithId variant="h2">{children}</HeadingWithId>,
      [BLOCKS.HEADING_3]: (_, children) => <HeadingWithId variant="h3">{children}</HeadingWithId>,
      [BLOCKS.HEADING_4]: (_, children) => <HeadingWithId variant="h4">{children}</HeadingWithId>,
      [BLOCKS.HEADING_5]: (_, children) => <HeadingWithId variant="h5">{children}</HeadingWithId>,
      [BLOCKS.HEADING_6]: (_, children) => <HeadingWithId variant="h6">{children}</HeadingWithId>,
      [BLOCKS.PARAGRAPH]: (_, children) => (
        <Typography sx={{ marginBottom: (theme) => theme.spacing(3.5) }} variant="body1">
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
  return (
    <Stack sx={sx}>
      {documentToReactComponents(json as unknown as Document, renderOptions(links))}
    </Stack>
  );
}
