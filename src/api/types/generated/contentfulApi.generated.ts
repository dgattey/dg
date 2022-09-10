export type Maybe<T> = T | undefined;
export type InputMaybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Circle: unknown;
  DateTime: string;
  Dimension: number;
  HexColor: string;
  JSON: {
    nodeType: string;
    data: Record<string, unknown> | undefined;
    value: string | undefined;
    content:
      | Array<{
          nodeType: string;
          data: Record<string, unknown> | undefined;
          value: string | undefined;
          content:
            | Array<{
                nodeType: string;
                data: Record<string, unknown> | undefined;
                value: string | undefined;
                content:
                  | Array<{
                      nodeType: string;
                      data: Record<string, unknown> | undefined;
                      value: string | undefined;
                      content:
                        | Array<{
                            nodeType: string;
                            data: Record<string, unknown> | undefined;
                            value: string | undefined;
                            content: Array<unknown> | undefined;
                          }>
                        | undefined;
                    }>
                  | undefined;
              }>
            | undefined;
        }>
      | undefined;
  };
  Quality: number;
  Rectangle: unknown;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type Asset = {
  readonly contentType: Maybe<Scalars['String']>;
  readonly contentfulMetadata: ContentfulMetadata;
  readonly description: Maybe<Scalars['String']>;
  readonly fileName: Maybe<Scalars['String']>;
  readonly height: Maybe<Scalars['Int']>;
  readonly linkedFrom: Maybe<AssetLinkingCollections>;
  readonly size: Maybe<Scalars['Int']>;
  readonly sys: Sys;
  readonly title: Maybe<Scalars['String']>;
  readonly url: Maybe<Scalars['String']>;
  readonly width: Maybe<Scalars['Int']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetContentTypeArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetDescriptionArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetFileNameArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetHeightArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetLinkedFromArgs = {
  allowedLocales: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetSizeArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetTitleArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetUrlArgs = {
  locale: InputMaybe<Scalars['String']>;
  transform: InputMaybe<ImageTransformOptions>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetWidthArgs = {
  locale: InputMaybe<Scalars['String']>;
};

export type AssetCollection = {
  readonly items: ReadonlyArray<Maybe<Asset>>;
  readonly limit: Scalars['Int'];
  readonly skip: Scalars['Int'];
  readonly total: Scalars['Int'];
};

export type AssetFilter = {
  readonly AND: InputMaybe<ReadonlyArray<InputMaybe<AssetFilter>>>;
  readonly OR: InputMaybe<ReadonlyArray<InputMaybe<AssetFilter>>>;
  readonly contentType: InputMaybe<Scalars['String']>;
  readonly contentType_contains: InputMaybe<Scalars['String']>;
  readonly contentType_exists: InputMaybe<Scalars['Boolean']>;
  readonly contentType_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly contentType_not: InputMaybe<Scalars['String']>;
  readonly contentType_not_contains: InputMaybe<Scalars['String']>;
  readonly contentType_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  readonly description: InputMaybe<Scalars['String']>;
  readonly description_contains: InputMaybe<Scalars['String']>;
  readonly description_exists: InputMaybe<Scalars['Boolean']>;
  readonly description_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly description_not: InputMaybe<Scalars['String']>;
  readonly description_not_contains: InputMaybe<Scalars['String']>;
  readonly description_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly fileName: InputMaybe<Scalars['String']>;
  readonly fileName_contains: InputMaybe<Scalars['String']>;
  readonly fileName_exists: InputMaybe<Scalars['Boolean']>;
  readonly fileName_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly fileName_not: InputMaybe<Scalars['String']>;
  readonly fileName_not_contains: InputMaybe<Scalars['String']>;
  readonly fileName_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly height: InputMaybe<Scalars['Int']>;
  readonly height_exists: InputMaybe<Scalars['Boolean']>;
  readonly height_gt: InputMaybe<Scalars['Int']>;
  readonly height_gte: InputMaybe<Scalars['Int']>;
  readonly height_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['Int']>>>;
  readonly height_lt: InputMaybe<Scalars['Int']>;
  readonly height_lte: InputMaybe<Scalars['Int']>;
  readonly height_not: InputMaybe<Scalars['Int']>;
  readonly height_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['Int']>>>;
  readonly size: InputMaybe<Scalars['Int']>;
  readonly size_exists: InputMaybe<Scalars['Boolean']>;
  readonly size_gt: InputMaybe<Scalars['Int']>;
  readonly size_gte: InputMaybe<Scalars['Int']>;
  readonly size_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['Int']>>>;
  readonly size_lt: InputMaybe<Scalars['Int']>;
  readonly size_lte: InputMaybe<Scalars['Int']>;
  readonly size_not: InputMaybe<Scalars['Int']>;
  readonly size_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['Int']>>>;
  readonly sys: InputMaybe<SysFilter>;
  readonly title: InputMaybe<Scalars['String']>;
  readonly title_contains: InputMaybe<Scalars['String']>;
  readonly title_exists: InputMaybe<Scalars['Boolean']>;
  readonly title_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly title_not: InputMaybe<Scalars['String']>;
  readonly title_not_contains: InputMaybe<Scalars['String']>;
  readonly title_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly url: InputMaybe<Scalars['String']>;
  readonly url_contains: InputMaybe<Scalars['String']>;
  readonly url_exists: InputMaybe<Scalars['Boolean']>;
  readonly url_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly url_not: InputMaybe<Scalars['String']>;
  readonly url_not_contains: InputMaybe<Scalars['String']>;
  readonly url_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly width: InputMaybe<Scalars['Int']>;
  readonly width_exists: InputMaybe<Scalars['Boolean']>;
  readonly width_gt: InputMaybe<Scalars['Int']>;
  readonly width_gte: InputMaybe<Scalars['Int']>;
  readonly width_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['Int']>>>;
  readonly width_lt: InputMaybe<Scalars['Int']>;
  readonly width_lte: InputMaybe<Scalars['Int']>;
  readonly width_not: InputMaybe<Scalars['Int']>;
  readonly width_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['Int']>>>;
};

export type AssetLinkingCollections = {
  readonly bookCollection: Maybe<BookCollection>;
  readonly contentTypeLocationCollection: Maybe<ContentTypeLocationCollection>;
  readonly entryCollection: Maybe<EntryCollection>;
  readonly projectCollection: Maybe<ProjectCollection>;
};

export type AssetLinkingCollectionsBookCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type AssetLinkingCollectionsContentTypeLocationCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type AssetLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type AssetLinkingCollectionsProjectCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type AssetOrder =
  | 'contentType_ASC'
  | 'contentType_DESC'
  | 'fileName_ASC'
  | 'fileName_DESC'
  | 'height_ASC'
  | 'height_DESC'
  | 'size_ASC'
  | 'size_DESC'
  | 'sys_firstPublishedAt_ASC'
  | 'sys_firstPublishedAt_DESC'
  | 'sys_id_ASC'
  | 'sys_id_DESC'
  | 'sys_publishedAt_ASC'
  | 'sys_publishedAt_DESC'
  | 'sys_publishedVersion_ASC'
  | 'sys_publishedVersion_DESC'
  | 'url_ASC'
  | 'url_DESC'
  | 'width_ASC'
  | 'width_DESC';

/** All data describing a recent book I've read. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/book) */
export type Book = Entry & {
  readonly author: Maybe<Scalars['String']>;
  readonly contentfulMetadata: ContentfulMetadata;
  readonly coverImage: Maybe<Asset>;
  readonly description: Maybe<BookDescription>;
  readonly linkedFrom: Maybe<BookLinkingCollections>;
  readonly readDate: Maybe<Scalars['DateTime']>;
  readonly sys: Sys;
  readonly title: Maybe<Scalars['String']>;
};

/** All data describing a recent book I've read. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/book) */
export type BookAuthorArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** All data describing a recent book I've read. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/book) */
export type BookCoverImageArgs = {
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
};

/** All data describing a recent book I've read. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/book) */
export type BookDescriptionArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** All data describing a recent book I've read. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/book) */
export type BookLinkedFromArgs = {
  allowedLocales: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
};

/** All data describing a recent book I've read. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/book) */
export type BookReadDateArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** All data describing a recent book I've read. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/book) */
export type BookTitleArgs = {
  locale: InputMaybe<Scalars['String']>;
};

export type BookCollection = {
  readonly items: ReadonlyArray<Maybe<Book>>;
  readonly limit: Scalars['Int'];
  readonly skip: Scalars['Int'];
  readonly total: Scalars['Int'];
};

export type BookDescription = {
  readonly json: Scalars['JSON'];
  readonly links: BookDescriptionLinks;
};

export type BookDescriptionAssets = {
  readonly block: ReadonlyArray<Maybe<Asset>>;
  readonly hyperlink: ReadonlyArray<Maybe<Asset>>;
};

export type BookDescriptionEntries = {
  readonly block: ReadonlyArray<Maybe<Entry>>;
  readonly hyperlink: ReadonlyArray<Maybe<Entry>>;
  readonly inline: ReadonlyArray<Maybe<Entry>>;
};

export type BookDescriptionLinks = {
  readonly assets: BookDescriptionAssets;
  readonly entries: BookDescriptionEntries;
};

export type BookFilter = {
  readonly AND: InputMaybe<ReadonlyArray<InputMaybe<BookFilter>>>;
  readonly OR: InputMaybe<ReadonlyArray<InputMaybe<BookFilter>>>;
  readonly author: InputMaybe<Scalars['String']>;
  readonly author_contains: InputMaybe<Scalars['String']>;
  readonly author_exists: InputMaybe<Scalars['Boolean']>;
  readonly author_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly author_not: InputMaybe<Scalars['String']>;
  readonly author_not_contains: InputMaybe<Scalars['String']>;
  readonly author_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  readonly coverImage_exists: InputMaybe<Scalars['Boolean']>;
  readonly description_contains: InputMaybe<Scalars['String']>;
  readonly description_exists: InputMaybe<Scalars['Boolean']>;
  readonly description_not_contains: InputMaybe<Scalars['String']>;
  readonly readDate: InputMaybe<Scalars['DateTime']>;
  readonly readDate_exists: InputMaybe<Scalars['Boolean']>;
  readonly readDate_gt: InputMaybe<Scalars['DateTime']>;
  readonly readDate_gte: InputMaybe<Scalars['DateTime']>;
  readonly readDate_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['DateTime']>>>;
  readonly readDate_lt: InputMaybe<Scalars['DateTime']>;
  readonly readDate_lte: InputMaybe<Scalars['DateTime']>;
  readonly readDate_not: InputMaybe<Scalars['DateTime']>;
  readonly readDate_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['DateTime']>>>;
  readonly sys: InputMaybe<SysFilter>;
  readonly title: InputMaybe<Scalars['String']>;
  readonly title_contains: InputMaybe<Scalars['String']>;
  readonly title_exists: InputMaybe<Scalars['Boolean']>;
  readonly title_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly title_not: InputMaybe<Scalars['String']>;
  readonly title_not_contains: InputMaybe<Scalars['String']>;
  readonly title_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
};

export type BookLinkingCollections = {
  readonly entryCollection: Maybe<EntryCollection>;
  readonly sectionCollection: Maybe<SectionCollection>;
};

export type BookLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type BookLinkingCollectionsSectionCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type BookOrder =
  | 'author_ASC'
  | 'author_DESC'
  | 'readDate_ASC'
  | 'readDate_DESC'
  | 'sys_firstPublishedAt_ASC'
  | 'sys_firstPublishedAt_DESC'
  | 'sys_id_ASC'
  | 'sys_id_DESC'
  | 'sys_publishedAt_ASC'
  | 'sys_publishedAt_DESC'
  | 'sys_publishedVersion_ASC'
  | 'sys_publishedVersion_DESC'
  | 'title_ASC'
  | 'title_DESC';

/** All info needed to render a map with a pin for the given location [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/location) */
export type ContentTypeLocation = Entry & {
  readonly contentfulMetadata: ContentfulMetadata;
  readonly image: Maybe<Asset>;
  readonly initialZoom: Maybe<Scalars['Float']>;
  readonly linkedFrom: Maybe<ContentTypeLocationLinkingCollections>;
  readonly point: Maybe<Location>;
  readonly slug: Maybe<Scalars['String']>;
  readonly sys: Sys;
  readonly zoomLevels: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
};

/** All info needed to render a map with a pin for the given location [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/location) */
export type ContentTypeLocationImageArgs = {
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
};

/** All info needed to render a map with a pin for the given location [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/location) */
export type ContentTypeLocationInitialZoomArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** All info needed to render a map with a pin for the given location [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/location) */
export type ContentTypeLocationLinkedFromArgs = {
  allowedLocales: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
};

/** All info needed to render a map with a pin for the given location [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/location) */
export type ContentTypeLocationPointArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** All info needed to render a map with a pin for the given location [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/location) */
export type ContentTypeLocationSlugArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** All info needed to render a map with a pin for the given location [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/location) */
export type ContentTypeLocationZoomLevelsArgs = {
  locale: InputMaybe<Scalars['String']>;
};

export type ContentTypeLocationCollection = {
  readonly items: ReadonlyArray<Maybe<ContentTypeLocation>>;
  readonly limit: Scalars['Int'];
  readonly skip: Scalars['Int'];
  readonly total: Scalars['Int'];
};

export type ContentTypeLocationFilter = {
  readonly AND: InputMaybe<ReadonlyArray<InputMaybe<ContentTypeLocationFilter>>>;
  readonly OR: InputMaybe<ReadonlyArray<InputMaybe<ContentTypeLocationFilter>>>;
  readonly contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  readonly image_exists: InputMaybe<Scalars['Boolean']>;
  readonly initialZoom: InputMaybe<Scalars['Float']>;
  readonly initialZoom_exists: InputMaybe<Scalars['Boolean']>;
  readonly initialZoom_gt: InputMaybe<Scalars['Float']>;
  readonly initialZoom_gte: InputMaybe<Scalars['Float']>;
  readonly initialZoom_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['Float']>>>;
  readonly initialZoom_lt: InputMaybe<Scalars['Float']>;
  readonly initialZoom_lte: InputMaybe<Scalars['Float']>;
  readonly initialZoom_not: InputMaybe<Scalars['Float']>;
  readonly initialZoom_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['Float']>>>;
  readonly point_exists: InputMaybe<Scalars['Boolean']>;
  readonly point_within_circle: InputMaybe<Scalars['Circle']>;
  readonly point_within_rectangle: InputMaybe<Scalars['Rectangle']>;
  readonly slug: InputMaybe<Scalars['String']>;
  readonly slug_contains: InputMaybe<Scalars['String']>;
  readonly slug_exists: InputMaybe<Scalars['Boolean']>;
  readonly slug_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly slug_not: InputMaybe<Scalars['String']>;
  readonly slug_not_contains: InputMaybe<Scalars['String']>;
  readonly slug_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly sys: InputMaybe<SysFilter>;
  readonly zoomLevels_contains_all: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly zoomLevels_contains_none: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly zoomLevels_contains_some: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly zoomLevels_exists: InputMaybe<Scalars['Boolean']>;
};

export type ContentTypeLocationLinkingCollections = {
  readonly entryCollection: Maybe<EntryCollection>;
};

export type ContentTypeLocationLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type ContentTypeLocationOrder =
  | 'initialZoom_ASC'
  | 'initialZoom_DESC'
  | 'slug_ASC'
  | 'slug_DESC'
  | 'sys_firstPublishedAt_ASC'
  | 'sys_firstPublishedAt_DESC'
  | 'sys_id_ASC'
  | 'sys_id_DESC'
  | 'sys_publishedAt_ASC'
  | 'sys_publishedAt_DESC'
  | 'sys_publishedVersion_ASC'
  | 'sys_publishedVersion_DESC';

export type ContentfulMetadata = {
  readonly tags: ReadonlyArray<Maybe<ContentfulTag>>;
};

export type ContentfulMetadataFilter = {
  readonly tags: InputMaybe<ContentfulMetadataTagsFilter>;
  readonly tags_exists: InputMaybe<Scalars['Boolean']>;
};

export type ContentfulMetadataTagsFilter = {
  readonly id_contains_all: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly id_contains_none: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly id_contains_some: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
};

/**
 * Represents a tag entity for finding and organizing content easily.
 *     Find out more here: https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/content-tags
 */
export type ContentfulTag = {
  readonly id: Maybe<Scalars['String']>;
  readonly name: Maybe<Scalars['String']>;
};

export type Entry = {
  readonly contentfulMetadata: ContentfulMetadata;
  readonly sys: Sys;
};

export type EntryCollection = {
  readonly items: ReadonlyArray<Maybe<Entry>>;
  readonly limit: Scalars['Int'];
  readonly skip: Scalars['Int'];
  readonly total: Scalars['Int'];
};

export type EntryFilter = {
  readonly AND: InputMaybe<ReadonlyArray<InputMaybe<EntryFilter>>>;
  readonly OR: InputMaybe<ReadonlyArray<InputMaybe<EntryFilter>>>;
  readonly contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  readonly sys: InputMaybe<SysFilter>;
};

export type EntryOrder =
  | 'sys_firstPublishedAt_ASC'
  | 'sys_firstPublishedAt_DESC'
  | 'sys_id_ASC'
  | 'sys_id_DESC'
  | 'sys_publishedAt_ASC'
  | 'sys_publishedAt_DESC'
  | 'sys_publishedVersion_ASC'
  | 'sys_publishedVersion_DESC';

export type ImageFormat =
  | 'AVIF'
  /** JPG image format. */
  | 'JPG'
  /**
   * Progressive JPG format stores multiple passes of an image in progressively higher detail.
   *         When a progressive image is loading, the viewer will first see a lower quality pixelated version which
   *         will gradually improve in detail, until the image is fully downloaded. This is to display an image as
   *         early as possible to make the layout look as designed.
   */
  | 'JPG_PROGRESSIVE'
  /** PNG image format */
  | 'PNG'
  /**
   * 8-bit PNG images support up to 256 colors and weigh less than the standard 24-bit PNG equivalent.
   *         The 8-bit PNG format is mostly used for simple images, such as icons or logos.
   */
  | 'PNG8'
  /** WebP image format. */
  | 'WEBP';

export type ImageResizeFocus =
  /** Focus the resizing on the bottom. */
  | 'BOTTOM'
  /** Focus the resizing on the bottom left. */
  | 'BOTTOM_LEFT'
  /** Focus the resizing on the bottom right. */
  | 'BOTTOM_RIGHT'
  /** Focus the resizing on the center. */
  | 'CENTER'
  /** Focus the resizing on the largest face. */
  | 'FACE'
  /** Focus the resizing on the area containing all the faces. */
  | 'FACES'
  /** Focus the resizing on the left. */
  | 'LEFT'
  /** Focus the resizing on the right. */
  | 'RIGHT'
  /** Focus the resizing on the top. */
  | 'TOP'
  /** Focus the resizing on the top left. */
  | 'TOP_LEFT'
  /** Focus the resizing on the top right. */
  | 'TOP_RIGHT';

export type ImageResizeStrategy =
  /** Crops a part of the original image to fit into the specified dimensions. */
  | 'CROP'
  /** Resizes the image to the specified dimensions, cropping the image if needed. */
  | 'FILL'
  /** Resizes the image to fit into the specified dimensions. */
  | 'FIT'
  /**
   * Resizes the image to the specified dimensions, padding the image if needed.
   *         Uses desired background color as padding color.
   */
  | 'PAD'
  /** Resizes the image to the specified dimensions, changing the original aspect ratio if needed. */
  | 'SCALE'
  /** Creates a thumbnail from the image. */
  | 'THUMB';

export type ImageTransformOptions = {
  /**
   * Desired background color, used with corner radius or `PAD` resize strategy.
   *         Defaults to transparent (for `PNG`, `PNG8` and `WEBP`) or white (for `JPG` and `JPG_PROGRESSIVE`).
   */
  readonly backgroundColor: InputMaybe<Scalars['HexColor']>;
  /**
   * Desired corner radius in pixels.
   *         Results in an image with rounded corners (pass `-1` for a full circle/ellipse).
   *         Defaults to `0`. Uses desired background color as padding color,
   *         unless the format is `JPG` or `JPG_PROGRESSIVE` and resize strategy is `PAD`, then defaults to white.
   */
  readonly cornerRadius: InputMaybe<Scalars['Int']>;
  /** Desired image format. Defaults to the original image format. */
  readonly format: InputMaybe<ImageFormat>;
  /** Desired height in pixels. Defaults to the original image height. */
  readonly height: InputMaybe<Scalars['Dimension']>;
  /**
   * Desired quality of the image in percents.
   *         Used for `PNG8`, `JPG`, `JPG_PROGRESSIVE` and `WEBP` formats.
   */
  readonly quality: InputMaybe<Scalars['Quality']>;
  /** Desired resize focus area. Defaults to `CENTER`. */
  readonly resizeFocus: InputMaybe<ImageResizeFocus>;
  /** Desired resize strategy. Defaults to `FIT`. */
  readonly resizeStrategy: InputMaybe<ImageResizeStrategy>;
  /** Desired width in pixels. Defaults to the original image width. */
  readonly width: InputMaybe<Scalars['Dimension']>;
};

/** A link to an external site of mine [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/link) */
export type Link = Entry & {
  readonly contentfulMetadata: ContentfulMetadata;
  readonly icon: Maybe<Scalars['String']>;
  readonly linkedFrom: Maybe<LinkLinkingCollections>;
  readonly sys: Sys;
  readonly title: Maybe<Scalars['String']>;
  readonly url: Maybe<Scalars['String']>;
};

/** A link to an external site of mine [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/link) */
export type LinkIconArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** A link to an external site of mine [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/link) */
export type LinkLinkedFromArgs = {
  allowedLocales: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
};

/** A link to an external site of mine [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/link) */
export type LinkTitleArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** A link to an external site of mine [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/link) */
export type LinkUrlArgs = {
  locale: InputMaybe<Scalars['String']>;
};

export type LinkCollection = {
  readonly items: ReadonlyArray<Maybe<Link>>;
  readonly limit: Scalars['Int'];
  readonly skip: Scalars['Int'];
  readonly total: Scalars['Int'];
};

export type LinkFilter = {
  readonly AND: InputMaybe<ReadonlyArray<InputMaybe<LinkFilter>>>;
  readonly OR: InputMaybe<ReadonlyArray<InputMaybe<LinkFilter>>>;
  readonly contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  readonly icon: InputMaybe<Scalars['String']>;
  readonly icon_contains: InputMaybe<Scalars['String']>;
  readonly icon_exists: InputMaybe<Scalars['Boolean']>;
  readonly icon_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly icon_not: InputMaybe<Scalars['String']>;
  readonly icon_not_contains: InputMaybe<Scalars['String']>;
  readonly icon_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly sys: InputMaybe<SysFilter>;
  readonly title: InputMaybe<Scalars['String']>;
  readonly title_contains: InputMaybe<Scalars['String']>;
  readonly title_exists: InputMaybe<Scalars['Boolean']>;
  readonly title_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly title_not: InputMaybe<Scalars['String']>;
  readonly title_not_contains: InputMaybe<Scalars['String']>;
  readonly title_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly url: InputMaybe<Scalars['String']>;
  readonly url_contains: InputMaybe<Scalars['String']>;
  readonly url_exists: InputMaybe<Scalars['Boolean']>;
  readonly url_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly url_not: InputMaybe<Scalars['String']>;
  readonly url_not_contains: InputMaybe<Scalars['String']>;
  readonly url_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
};

export type LinkLinkingCollections = {
  readonly entryCollection: Maybe<EntryCollection>;
  readonly projectCollection: Maybe<ProjectCollection>;
  readonly sectionCollection: Maybe<SectionCollection>;
};

export type LinkLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type LinkLinkingCollectionsProjectCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type LinkLinkingCollectionsSectionCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type LinkOrder =
  | 'sys_firstPublishedAt_ASC'
  | 'sys_firstPublishedAt_DESC'
  | 'sys_id_ASC'
  | 'sys_id_DESC'
  | 'sys_publishedAt_ASC'
  | 'sys_publishedAt_DESC'
  | 'sys_publishedVersion_ASC'
  | 'sys_publishedVersion_DESC'
  | 'title_ASC'
  | 'title_DESC'
  | 'url_ASC'
  | 'url_DESC';

export type Location = {
  readonly lat: Maybe<Scalars['Float']>;
  readonly lon: Maybe<Scalars['Float']>;
};

/** Website, app, other code-based project, or graphics created for something. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/project) */
export type Project = Entry & {
  readonly contentfulMetadata: ContentfulMetadata;
  readonly creationDate: Maybe<Scalars['DateTime']>;
  readonly description: Maybe<ProjectDescription>;
  readonly layout: Maybe<Scalars['String']>;
  readonly link: Maybe<Link>;
  readonly linkedFrom: Maybe<ProjectLinkingCollections>;
  readonly sys: Sys;
  readonly thumbnail: Maybe<Asset>;
  readonly title: Maybe<Scalars['String']>;
  readonly type: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
};

/** Website, app, other code-based project, or graphics created for something. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/project) */
export type ProjectCreationDateArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** Website, app, other code-based project, or graphics created for something. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/project) */
export type ProjectDescriptionArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** Website, app, other code-based project, or graphics created for something. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/project) */
export type ProjectLayoutArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** Website, app, other code-based project, or graphics created for something. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/project) */
export type ProjectLinkArgs = {
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
};

/** Website, app, other code-based project, or graphics created for something. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/project) */
export type ProjectLinkedFromArgs = {
  allowedLocales: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
};

/** Website, app, other code-based project, or graphics created for something. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/project) */
export type ProjectThumbnailArgs = {
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
};

/** Website, app, other code-based project, or graphics created for something. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/project) */
export type ProjectTitleArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** Website, app, other code-based project, or graphics created for something. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/project) */
export type ProjectTypeArgs = {
  locale: InputMaybe<Scalars['String']>;
};

export type ProjectCollection = {
  readonly items: ReadonlyArray<Maybe<Project>>;
  readonly limit: Scalars['Int'];
  readonly skip: Scalars['Int'];
  readonly total: Scalars['Int'];
};

export type ProjectDescription = {
  readonly json: Scalars['JSON'];
  readonly links: ProjectDescriptionLinks;
};

export type ProjectDescriptionAssets = {
  readonly block: ReadonlyArray<Maybe<Asset>>;
  readonly hyperlink: ReadonlyArray<Maybe<Asset>>;
};

export type ProjectDescriptionEntries = {
  readonly block: ReadonlyArray<Maybe<Entry>>;
  readonly hyperlink: ReadonlyArray<Maybe<Entry>>;
  readonly inline: ReadonlyArray<Maybe<Entry>>;
};

export type ProjectDescriptionLinks = {
  readonly assets: ProjectDescriptionAssets;
  readonly entries: ProjectDescriptionEntries;
};

export type ProjectFilter = {
  readonly AND: InputMaybe<ReadonlyArray<InputMaybe<ProjectFilter>>>;
  readonly OR: InputMaybe<ReadonlyArray<InputMaybe<ProjectFilter>>>;
  readonly contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  readonly creationDate: InputMaybe<Scalars['DateTime']>;
  readonly creationDate_exists: InputMaybe<Scalars['Boolean']>;
  readonly creationDate_gt: InputMaybe<Scalars['DateTime']>;
  readonly creationDate_gte: InputMaybe<Scalars['DateTime']>;
  readonly creationDate_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['DateTime']>>>;
  readonly creationDate_lt: InputMaybe<Scalars['DateTime']>;
  readonly creationDate_lte: InputMaybe<Scalars['DateTime']>;
  readonly creationDate_not: InputMaybe<Scalars['DateTime']>;
  readonly creationDate_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['DateTime']>>>;
  readonly description_contains: InputMaybe<Scalars['String']>;
  readonly description_exists: InputMaybe<Scalars['Boolean']>;
  readonly description_not_contains: InputMaybe<Scalars['String']>;
  readonly layout: InputMaybe<Scalars['String']>;
  readonly layout_contains: InputMaybe<Scalars['String']>;
  readonly layout_exists: InputMaybe<Scalars['Boolean']>;
  readonly layout_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly layout_not: InputMaybe<Scalars['String']>;
  readonly layout_not_contains: InputMaybe<Scalars['String']>;
  readonly layout_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly link: InputMaybe<CfLinkNestedFilter>;
  readonly link_exists: InputMaybe<Scalars['Boolean']>;
  readonly sys: InputMaybe<SysFilter>;
  readonly thumbnail_exists: InputMaybe<Scalars['Boolean']>;
  readonly title: InputMaybe<Scalars['String']>;
  readonly title_contains: InputMaybe<Scalars['String']>;
  readonly title_exists: InputMaybe<Scalars['Boolean']>;
  readonly title_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly title_not: InputMaybe<Scalars['String']>;
  readonly title_not_contains: InputMaybe<Scalars['String']>;
  readonly title_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly type_contains_all: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly type_contains_none: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly type_contains_some: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly type_exists: InputMaybe<Scalars['Boolean']>;
};

export type ProjectLinkingCollections = {
  readonly entryCollection: Maybe<EntryCollection>;
  readonly sectionCollection: Maybe<SectionCollection>;
};

export type ProjectLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type ProjectLinkingCollectionsSectionCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type ProjectOrder =
  | 'creationDate_ASC'
  | 'creationDate_DESC'
  | 'layout_ASC'
  | 'layout_DESC'
  | 'sys_firstPublishedAt_ASC'
  | 'sys_firstPublishedAt_DESC'
  | 'sys_id_ASC'
  | 'sys_id_DESC'
  | 'sys_publishedAt_ASC'
  | 'sys_publishedAt_DESC'
  | 'sys_publishedVersion_ASC'
  | 'sys_publishedVersion_DESC'
  | 'title_ASC'
  | 'title_DESC';

export type Query = {
  readonly asset: Maybe<Asset>;
  readonly assetCollection: Maybe<AssetCollection>;
  readonly book: Maybe<Book>;
  readonly bookCollection: Maybe<BookCollection>;
  readonly contentTypeLocation: Maybe<ContentTypeLocation>;
  readonly contentTypeLocationCollection: Maybe<ContentTypeLocationCollection>;
  readonly entryCollection: Maybe<EntryCollection>;
  readonly link: Maybe<Link>;
  readonly linkCollection: Maybe<LinkCollection>;
  readonly project: Maybe<Project>;
  readonly projectCollection: Maybe<ProjectCollection>;
  readonly section: Maybe<Section>;
  readonly sectionCollection: Maybe<SectionCollection>;
  readonly textBlock: Maybe<TextBlock>;
  readonly textBlockCollection: Maybe<TextBlockCollection>;
};

export type QueryAssetArgs = {
  id: Scalars['String'];
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
};

export type QueryAssetCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  order: InputMaybe<ReadonlyArray<InputMaybe<AssetOrder>>>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where: InputMaybe<AssetFilter>;
};

export type QueryBookArgs = {
  id: Scalars['String'];
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
};

export type QueryBookCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  order: InputMaybe<ReadonlyArray<InputMaybe<BookOrder>>>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where: InputMaybe<BookFilter>;
};

export type QueryContentTypeLocationArgs = {
  id: Scalars['String'];
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
};

export type QueryContentTypeLocationCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  order: InputMaybe<ReadonlyArray<InputMaybe<ContentTypeLocationOrder>>>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where: InputMaybe<ContentTypeLocationFilter>;
};

export type QueryEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  order: InputMaybe<ReadonlyArray<InputMaybe<EntryOrder>>>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where: InputMaybe<EntryFilter>;
};

export type QueryLinkArgs = {
  id: Scalars['String'];
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
};

export type QueryLinkCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  order: InputMaybe<ReadonlyArray<InputMaybe<LinkOrder>>>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where: InputMaybe<LinkFilter>;
};

export type QueryProjectArgs = {
  id: Scalars['String'];
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
};

export type QueryProjectCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  order: InputMaybe<ReadonlyArray<InputMaybe<ProjectOrder>>>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where: InputMaybe<ProjectFilter>;
};

export type QuerySectionArgs = {
  id: Scalars['String'];
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
};

export type QuerySectionCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  order: InputMaybe<ReadonlyArray<InputMaybe<SectionOrder>>>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where: InputMaybe<SectionFilter>;
};

export type QueryTextBlockArgs = {
  id: Scalars['String'];
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
};

export type QueryTextBlockCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  order: InputMaybe<ReadonlyArray<InputMaybe<TextBlockOrder>>>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where: InputMaybe<TextBlockFilter>;
};

/** A collection of references to other nodes [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/section) */
export type Section = Entry & {
  readonly blocksCollection: Maybe<SectionBlocksCollection>;
  readonly contentfulMetadata: ContentfulMetadata;
  readonly linkedFrom: Maybe<SectionLinkingCollections>;
  readonly slug: Maybe<Scalars['String']>;
  readonly sys: Sys;
};

/** A collection of references to other nodes [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/section) */
export type SectionBlocksCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

/** A collection of references to other nodes [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/section) */
export type SectionLinkedFromArgs = {
  allowedLocales: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
};

/** A collection of references to other nodes [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/section) */
export type SectionSlugArgs = {
  locale: InputMaybe<Scalars['String']>;
};

export type SectionBlocksCollection = {
  readonly items: ReadonlyArray<Maybe<SectionBlocksItem>>;
  readonly limit: Scalars['Int'];
  readonly skip: Scalars['Int'];
  readonly total: Scalars['Int'];
};

export type SectionBlocksItem = Book | Link | Project;

export type SectionCollection = {
  readonly items: ReadonlyArray<Maybe<Section>>;
  readonly limit: Scalars['Int'];
  readonly skip: Scalars['Int'];
  readonly total: Scalars['Int'];
};

export type SectionFilter = {
  readonly AND: InputMaybe<ReadonlyArray<InputMaybe<SectionFilter>>>;
  readonly OR: InputMaybe<ReadonlyArray<InputMaybe<SectionFilter>>>;
  readonly blocksCollection_exists: InputMaybe<Scalars['Boolean']>;
  readonly contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  readonly slug: InputMaybe<Scalars['String']>;
  readonly slug_contains: InputMaybe<Scalars['String']>;
  readonly slug_exists: InputMaybe<Scalars['Boolean']>;
  readonly slug_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly slug_not: InputMaybe<Scalars['String']>;
  readonly slug_not_contains: InputMaybe<Scalars['String']>;
  readonly slug_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly sys: InputMaybe<SysFilter>;
};

export type SectionLinkingCollections = {
  readonly entryCollection: Maybe<EntryCollection>;
};

export type SectionLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type SectionOrder =
  | 'slug_ASC'
  | 'slug_DESC'
  | 'sys_firstPublishedAt_ASC'
  | 'sys_firstPublishedAt_DESC'
  | 'sys_id_ASC'
  | 'sys_id_DESC'
  | 'sys_publishedAt_ASC'
  | 'sys_publishedAt_DESC'
  | 'sys_publishedVersion_ASC'
  | 'sys_publishedVersion_DESC';

export type Sys = {
  readonly environmentId: Scalars['String'];
  readonly firstPublishedAt: Maybe<Scalars['DateTime']>;
  readonly id: Scalars['String'];
  readonly publishedAt: Maybe<Scalars['DateTime']>;
  readonly publishedVersion: Maybe<Scalars['Int']>;
  readonly spaceId: Scalars['String'];
};

export type SysFilter = {
  readonly firstPublishedAt: InputMaybe<Scalars['DateTime']>;
  readonly firstPublishedAt_exists: InputMaybe<Scalars['Boolean']>;
  readonly firstPublishedAt_gt: InputMaybe<Scalars['DateTime']>;
  readonly firstPublishedAt_gte: InputMaybe<Scalars['DateTime']>;
  readonly firstPublishedAt_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['DateTime']>>>;
  readonly firstPublishedAt_lt: InputMaybe<Scalars['DateTime']>;
  readonly firstPublishedAt_lte: InputMaybe<Scalars['DateTime']>;
  readonly firstPublishedAt_not: InputMaybe<Scalars['DateTime']>;
  readonly firstPublishedAt_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['DateTime']>>>;
  readonly id: InputMaybe<Scalars['String']>;
  readonly id_contains: InputMaybe<Scalars['String']>;
  readonly id_exists: InputMaybe<Scalars['Boolean']>;
  readonly id_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly id_not: InputMaybe<Scalars['String']>;
  readonly id_not_contains: InputMaybe<Scalars['String']>;
  readonly id_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly publishedAt: InputMaybe<Scalars['DateTime']>;
  readonly publishedAt_exists: InputMaybe<Scalars['Boolean']>;
  readonly publishedAt_gt: InputMaybe<Scalars['DateTime']>;
  readonly publishedAt_gte: InputMaybe<Scalars['DateTime']>;
  readonly publishedAt_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['DateTime']>>>;
  readonly publishedAt_lt: InputMaybe<Scalars['DateTime']>;
  readonly publishedAt_lte: InputMaybe<Scalars['DateTime']>;
  readonly publishedAt_not: InputMaybe<Scalars['DateTime']>;
  readonly publishedAt_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['DateTime']>>>;
  readonly publishedVersion: InputMaybe<Scalars['Float']>;
  readonly publishedVersion_exists: InputMaybe<Scalars['Boolean']>;
  readonly publishedVersion_gt: InputMaybe<Scalars['Float']>;
  readonly publishedVersion_gte: InputMaybe<Scalars['Float']>;
  readonly publishedVersion_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['Float']>>>;
  readonly publishedVersion_lt: InputMaybe<Scalars['Float']>;
  readonly publishedVersion_lte: InputMaybe<Scalars['Float']>;
  readonly publishedVersion_not: InputMaybe<Scalars['Float']>;
  readonly publishedVersion_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['Float']>>>;
};

/** A block of rich text, for use with things like Privacy Policy/introduction paragraph/etc [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/textBlock) */
export type TextBlock = Entry & {
  readonly content: Maybe<TextBlockContent>;
  readonly contentfulMetadata: ContentfulMetadata;
  readonly linkedFrom: Maybe<TextBlockLinkingCollections>;
  readonly slug: Maybe<Scalars['String']>;
  readonly sys: Sys;
};

/** A block of rich text, for use with things like Privacy Policy/introduction paragraph/etc [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/textBlock) */
export type TextBlockContentArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** A block of rich text, for use with things like Privacy Policy/introduction paragraph/etc [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/textBlock) */
export type TextBlockLinkedFromArgs = {
  allowedLocales: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
};

/** A block of rich text, for use with things like Privacy Policy/introduction paragraph/etc [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/textBlock) */
export type TextBlockSlugArgs = {
  locale: InputMaybe<Scalars['String']>;
};

export type TextBlockCollection = {
  readonly items: ReadonlyArray<Maybe<TextBlock>>;
  readonly limit: Scalars['Int'];
  readonly skip: Scalars['Int'];
  readonly total: Scalars['Int'];
};

export type TextBlockContent = {
  readonly json: Scalars['JSON'];
  readonly links: TextBlockContentLinks;
};

export type TextBlockContentAssets = {
  readonly block: ReadonlyArray<Maybe<Asset>>;
  readonly hyperlink: ReadonlyArray<Maybe<Asset>>;
};

export type TextBlockContentEntries = {
  readonly block: ReadonlyArray<Maybe<Entry>>;
  readonly hyperlink: ReadonlyArray<Maybe<Entry>>;
  readonly inline: ReadonlyArray<Maybe<Entry>>;
};

export type TextBlockContentLinks = {
  readonly assets: TextBlockContentAssets;
  readonly entries: TextBlockContentEntries;
};

export type TextBlockFilter = {
  readonly AND: InputMaybe<ReadonlyArray<InputMaybe<TextBlockFilter>>>;
  readonly OR: InputMaybe<ReadonlyArray<InputMaybe<TextBlockFilter>>>;
  readonly content_contains: InputMaybe<Scalars['String']>;
  readonly content_exists: InputMaybe<Scalars['Boolean']>;
  readonly content_not_contains: InputMaybe<Scalars['String']>;
  readonly contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  readonly slug: InputMaybe<Scalars['String']>;
  readonly slug_contains: InputMaybe<Scalars['String']>;
  readonly slug_exists: InputMaybe<Scalars['Boolean']>;
  readonly slug_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly slug_not: InputMaybe<Scalars['String']>;
  readonly slug_not_contains: InputMaybe<Scalars['String']>;
  readonly slug_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly sys: InputMaybe<SysFilter>;
};

export type TextBlockLinkingCollections = {
  readonly entryCollection: Maybe<EntryCollection>;
};

export type TextBlockLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type TextBlockOrder =
  | 'slug_ASC'
  | 'slug_DESC'
  | 'sys_firstPublishedAt_ASC'
  | 'sys_firstPublishedAt_DESC'
  | 'sys_id_ASC'
  | 'sys_id_DESC'
  | 'sys_publishedAt_ASC'
  | 'sys_publishedAt_DESC'
  | 'sys_publishedVersion_ASC'
  | 'sys_publishedVersion_DESC';

export type CfLinkNestedFilter = {
  readonly AND: InputMaybe<ReadonlyArray<InputMaybe<CfLinkNestedFilter>>>;
  readonly OR: InputMaybe<ReadonlyArray<InputMaybe<CfLinkNestedFilter>>>;
  readonly contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  readonly icon: InputMaybe<Scalars['String']>;
  readonly icon_contains: InputMaybe<Scalars['String']>;
  readonly icon_exists: InputMaybe<Scalars['Boolean']>;
  readonly icon_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly icon_not: InputMaybe<Scalars['String']>;
  readonly icon_not_contains: InputMaybe<Scalars['String']>;
  readonly icon_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly sys: InputMaybe<SysFilter>;
  readonly title: InputMaybe<Scalars['String']>;
  readonly title_contains: InputMaybe<Scalars['String']>;
  readonly title_exists: InputMaybe<Scalars['Boolean']>;
  readonly title_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly title_not: InputMaybe<Scalars['String']>;
  readonly title_not_contains: InputMaybe<Scalars['String']>;
  readonly title_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly url: InputMaybe<Scalars['String']>;
  readonly url_contains: InputMaybe<Scalars['String']>;
  readonly url_exists: InputMaybe<Scalars['Boolean']>;
  readonly url_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly url_not: InputMaybe<Scalars['String']>;
  readonly url_not_contains: InputMaybe<Scalars['String']>;
  readonly url_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
};
