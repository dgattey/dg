import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer';
import type { Document, NodeData } from '@contentful/rich-text-types';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import type { Asset, Entry, TextBlockContent } from 'api/contentful/generated/api.generated';
import { isDefinedItem, isLink } from 'api/contentful/typeguards';
import Image from './Image';
import Link from './Link';

type Props = TextBlockContent;

/**
 * Defines a Node's Data with actual data
 */
type DataWithId = {
  target?: {
    sys?: {
      /**
       * UUID for the value
       */
      id: string;
    };
  };
};

/**
 * Typeguard for converting the `any` to a structured object
 */
const isDataWithId = (data: NodeData): data is DataWithId =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  !!(data as DataWithId)?.target?.sys?.id;

// Create a bespoke renderOptions object to target BLOCKS.EMBEDDED_ENTRY (linked block entries e.g. code blocks)
// INLINES.EMBEDDED_ENTRY (linked inline entries e.g. a reference to another blog post)
// and BLOCKS.EMBEDDED_ASSET (linked assets e.g. images)

const renderOptions = (links: TextBlockContent['links']): Options => {
  // Map the assets
  const assetMap = new Map<string | undefined, Asset>();
  links.assets.block.filter(isDefinedItem).forEach((asset) => assetMap.set(asset?.sys.id, asset));

  // Map the inline and block entries
  const entryMap = new Map<string | undefined, Entry>();
  links.entries.block.filter(isDefinedItem).forEach((entry) => entryMap.set(entry?.sys.id, entry));
  links.entries.inline.filter(isDefinedItem).forEach((entry) => entryMap.set(entry?.sys.id, entry));

  return {
    renderNode: {
      [INLINES.EMBEDDED_ENTRY]: ({ data }) => {
        if (!isDataWithId(data)) {
          return null;
        }
        const entry = entryMap.get(data.target?.sys?.id);

        if (isLink(entry)) {
          return <Link {...entry} />;
        }

        return null;
      },
      [BLOCKS.EMBEDDED_ENTRY]: ({ data }) => {
        if (!isDataWithId(data)) {
          return null;
        }
        const entry = entryMap.get(data.target?.sys?.id);

        if (isLink(entry)) {
          return <Link {...entry} />;
        }

        return null;
      },
      [BLOCKS.EMBEDDED_ASSET]: ({ data }) => {
        if (!isDataWithId(data)) {
          return null;
        }
        const asset = assetMap.get(data.target?.sys?.id);
        return asset ? <Image {...asset} alt={asset.title} /> : null;
      },
    },
  };
};

/**
 * Complicated component to render rich text from Contentful's rich
 * text renderer, resolving all items to components
 */
const RichText = ({ json, links }: Props) => (
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  <>{documentToReactComponents(json as unknown as Document, renderOptions(links))}</>
);

export default RichText;
