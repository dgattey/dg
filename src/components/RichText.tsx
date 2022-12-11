import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer';
import type { Document, NodeData } from '@contentful/rich-text-types';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { Box, Divider, SxProps, Theme, Typography } from '@mui/material';
import { isDefinedItem, isLink, isProject } from 'api/parsers';
import type { Asset, Entry, TextBlockContent } from 'api/types/generated/contentfulApi.generated';
import { ProjectCard } from 'components/homepage/ProjectCard';
import { PROJECT_MAX_IMAGE_DIMENSION } from 'constants/imageSizes';
import { Image } from './Image';
import { Link } from './Link';

type RichTextProps = TextBlockContent & {
  sx?: SxProps<Theme>;
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

const HEADING_SX: SxProps<Theme> = { marginBottom: (theme) => theme.spacing(3) };

/**
 * Typeguard for converting the `any` to a structured object
 */
const isDataWithId = (data: NodeData): data is DataWithId =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  !!(data as DataWithId)?.target?.sys?.id;

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
 * Takes links and converts them into rich text through rendering specific types of content.
 */
const renderOptions = (links: TextBlockContent['links']): Options => {
  // Map the assets
  const assetMap = new Map<string, Asset>();
  links.assets.block.filter(isDefinedItem).forEach((asset) => assetMap.set(asset.sys.id, asset));

  // Map the inline and block entries
  const entryMap = new Map<string, Entry>();
  [...links.entries.block, ...links.entries.inline]
    .filter(isDefinedItem)
    .forEach((entry) => entryMap.set(entry.sys.id, entry));

  return {
    renderNode: {
      [BLOCKS.HEADING_1]: (_, children) => (
        <Typography variant="h1" sx={HEADING_SX}>
          {children}
        </Typography>
      ),
      [BLOCKS.HEADING_2]: (_, children) => (
        <Typography variant="h2" sx={HEADING_SX}>
          {children}
        </Typography>
      ),
      [BLOCKS.HEADING_3]: (_, children) => (
        <Typography variant="h3" sx={HEADING_SX}>
          {children}
        </Typography>
      ),
      [BLOCKS.HEADING_4]: (_, children) => (
        <Typography variant="h4" sx={HEADING_SX}>
          {children}
        </Typography>
      ),
      [BLOCKS.HEADING_5]: (_, children) => (
        <Typography variant="h5" sx={HEADING_SX}>
          {children}
        </Typography>
      ),
      [BLOCKS.HEADING_6]: (_, children) => (
        <Typography variant="h6" sx={HEADING_SX}>
          {children}
        </Typography>
      ),
      [BLOCKS.PARAGRAPH]: (_, children) => (
        <Typography variant="body1" sx={{ marginBottom: (theme) => theme.spacing(3.5) }}>
          {children}
        </Typography>
      ),
      [BLOCKS.HR]: () => <Divider />,
      [INLINES.EMBEDDED_ENTRY]: ({ data }) => <EntryElement data={data} entryMap={entryMap} />,
      [BLOCKS.EMBEDDED_ENTRY]: ({ data }) => <EntryElement data={data} entryMap={entryMap} />,
      [BLOCKS.EMBEDDED_ASSET]: ({ data }) => <AssetElement data={data} assetMap={assetMap} />,
    },
  };
};

/**
 * Complicated component to render rich text from Contentful's rich
 * text renderer, resolving all items to components
 */
export function RichText({ json, links, sx }: RichTextProps) {
  return (
    <Box sx={sx}>
      {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        documentToReactComponents(json as unknown as Document, renderOptions(links))
      }
    </Box>
  );
}
