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
  /**
   * A date-time string at UTC, such as 2007-12-03T10:15:30Z,
   *     compliant with the 'date-time' format outlined in section 5.6 of
   *     the RFC 3339 profile of the ISO 8601 standard for representation
   *     of dates and times using the Gregorian calendar.
   */
  DateTime: string;
  /** The 'Dimension' type represents dimensions as whole numeric values between `1` and `4000`. */
  Dimension: number;
  /** The 'HexColor' type represents color in `rgb:ffffff` string format. */
  HexColor: string;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { readonly [Symbol.toStringTag]: string };
  /** The 'Quality' type represents quality as whole numeric values between `1` and `100`. */
  Quality: number;
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
export type AssetLinkedFromArgs = {
  allowedLocales: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetUrlArgs = {
  transform: InputMaybe<ImageTransformOptions>;
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
  readonly entryCollection: Maybe<EntryCollection>;
  readonly projectCollection: Maybe<ProjectCollection>;
  readonly textCollection: Maybe<TextCollection>;
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

export type AssetLinkingCollectionsTextCollectionArgs = {
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
  readonly coverImageUrl: Maybe<Scalars['String']>;
  readonly description: Maybe<BookDescription>;
  readonly linkedFrom: Maybe<BookLinkingCollections>;
  readonly sys: Sys;
  readonly title: Maybe<Scalars['String']>;
};

/** All data describing a recent book I've read. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/book) */
export type BookAuthorArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** All data describing a recent book I've read. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/book) */
export type BookCoverImageUrlArgs = {
  locale: InputMaybe<Scalars['String']>;
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
  readonly coverImageUrl: InputMaybe<Scalars['String']>;
  readonly coverImageUrl_contains: InputMaybe<Scalars['String']>;
  readonly coverImageUrl_exists: InputMaybe<Scalars['Boolean']>;
  readonly coverImageUrl_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly coverImageUrl_not: InputMaybe<Scalars['String']>;
  readonly coverImageUrl_not_contains: InputMaybe<Scalars['String']>;
  readonly coverImageUrl_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly description_contains: InputMaybe<Scalars['String']>;
  readonly description_exists: InputMaybe<Scalars['Boolean']>;
  readonly description_not_contains: InputMaybe<Scalars['String']>;
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
};

export type BookLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type BookOrder =
  | 'author_ASC'
  | 'author_DESC'
  | 'coverImageUrl_ASC'
  | 'coverImageUrl_DESC'
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

/** A page composed of multiple text blocks and other info about it [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/page) */
export type Page = Entry & {
  readonly contentfulMetadata: ContentfulMetadata;
  readonly linkedFrom: Maybe<PageLinkingCollections>;
  readonly sectionsCollection: Maybe<PageSectionsCollection>;
  readonly slug: Maybe<Scalars['String']>;
  readonly sys: Sys;
  readonly title: Maybe<Scalars['String']>;
};

/** A page composed of multiple text blocks and other info about it [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/page) */
export type PageLinkedFromArgs = {
  allowedLocales: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
};

/** A page composed of multiple text blocks and other info about it [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/page) */
export type PageSectionsCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

/** A page composed of multiple text blocks and other info about it [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/page) */
export type PageSlugArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** A page composed of multiple text blocks and other info about it [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/page) */
export type PageTitleArgs = {
  locale: InputMaybe<Scalars['String']>;
};

export type PageCollection = {
  readonly items: ReadonlyArray<Maybe<Page>>;
  readonly limit: Scalars['Int'];
  readonly skip: Scalars['Int'];
  readonly total: Scalars['Int'];
};

export type PageFilter = {
  readonly AND: InputMaybe<ReadonlyArray<InputMaybe<PageFilter>>>;
  readonly OR: InputMaybe<ReadonlyArray<InputMaybe<PageFilter>>>;
  readonly contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  readonly sectionsCollection_exists: InputMaybe<Scalars['Boolean']>;
  readonly slug: InputMaybe<Scalars['String']>;
  readonly slug_contains: InputMaybe<Scalars['String']>;
  readonly slug_exists: InputMaybe<Scalars['Boolean']>;
  readonly slug_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly slug_not: InputMaybe<Scalars['String']>;
  readonly slug_not_contains: InputMaybe<Scalars['String']>;
  readonly slug_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly sys: InputMaybe<SysFilter>;
  readonly title: InputMaybe<Scalars['String']>;
  readonly title_contains: InputMaybe<Scalars['String']>;
  readonly title_exists: InputMaybe<Scalars['Boolean']>;
  readonly title_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly title_not: InputMaybe<Scalars['String']>;
  readonly title_not_contains: InputMaybe<Scalars['String']>;
  readonly title_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
};

export type PageLinkingCollections = {
  readonly entryCollection: Maybe<EntryCollection>;
};

export type PageLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type PageOrder =
  | 'slug_ASC'
  | 'slug_DESC'
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

export type PageSectionsCollection = {
  readonly items: ReadonlyArray<Maybe<Entry>>;
  readonly limit: Scalars['Int'];
  readonly skip: Scalars['Int'];
  readonly total: Scalars['Int'];
};

/** Website, app, other code-based project, or graphics created for something. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/project) */
export type Project = Entry & {
  readonly contentfulMetadata: ContentfulMetadata;
  readonly creationDate: Maybe<Scalars['DateTime']>;
  readonly description: Maybe<ProjectDescription>;
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
};

export type ProjectLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type ProjectOrder =
  | 'creationDate_ASC'
  | 'creationDate_DESC'
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
  readonly entryCollection: Maybe<EntryCollection>;
  readonly link: Maybe<Link>;
  readonly linkCollection: Maybe<LinkCollection>;
  readonly page: Maybe<Page>;
  readonly pageCollection: Maybe<PageCollection>;
  readonly project: Maybe<Project>;
  readonly projectCollection: Maybe<ProjectCollection>;
  readonly section: Maybe<Section>;
  readonly sectionCollection: Maybe<SectionCollection>;
  readonly text: Maybe<Text>;
  readonly textCollection: Maybe<TextCollection>;
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

export type QueryPageArgs = {
  id: Scalars['String'];
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
};

export type QueryPageCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  order: InputMaybe<ReadonlyArray<InputMaybe<PageOrder>>>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where: InputMaybe<PageFilter>;
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

export type QueryTextArgs = {
  id: Scalars['String'];
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
};

export type QueryTextCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  order: InputMaybe<ReadonlyArray<InputMaybe<TextOrder>>>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where: InputMaybe<TextFilter>;
};

/** A section containing references to other blocks. Based on the content of the section, may appear differently on different pages. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/section) */
export type Section = Entry & {
  readonly blocksCollection: Maybe<SectionBlocksCollection>;
  readonly contentfulMetadata: ContentfulMetadata;
  readonly linkedFrom: Maybe<SectionLinkingCollections>;
  readonly sys: Sys;
  readonly title: Maybe<Scalars['String']>;
};

/** A section containing references to other blocks. Based on the content of the section, may appear differently on different pages. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/section) */
export type SectionBlocksCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

/** A section containing references to other blocks. Based on the content of the section, may appear differently on different pages. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/section) */
export type SectionLinkedFromArgs = {
  allowedLocales: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
};

/** A section containing references to other blocks. Based on the content of the section, may appear differently on different pages. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/section) */
export type SectionTitleArgs = {
  locale: InputMaybe<Scalars['String']>;
};

export type SectionBlocksCollection = {
  readonly items: ReadonlyArray<Maybe<Entry>>;
  readonly limit: Scalars['Int'];
  readonly skip: Scalars['Int'];
  readonly total: Scalars['Int'];
};

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
  readonly sys: InputMaybe<SysFilter>;
  readonly title: InputMaybe<Scalars['String']>;
  readonly title_contains: InputMaybe<Scalars['String']>;
  readonly title_exists: InputMaybe<Scalars['Boolean']>;
  readonly title_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly title_not: InputMaybe<Scalars['String']>;
  readonly title_not_contains: InputMaybe<Scalars['String']>;
  readonly title_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
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

/** Rich text together with an optional image, used in sections and pages. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/text) */
export type Text = Entry & {
  readonly contentfulMetadata: ContentfulMetadata;
  readonly identifier: Maybe<Scalars['String']>;
  readonly image: Maybe<Asset>;
  readonly imageType: Maybe<Scalars['String']>;
  readonly linkedFrom: Maybe<TextLinkingCollections>;
  readonly sys: Sys;
  readonly text: Maybe<TextText>;
};

/** Rich text together with an optional image, used in sections and pages. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/text) */
export type TextIdentifierArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** Rich text together with an optional image, used in sections and pages. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/text) */
export type TextImageArgs = {
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
};

/** Rich text together with an optional image, used in sections and pages. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/text) */
export type TextImageTypeArgs = {
  locale: InputMaybe<Scalars['String']>;
};

/** Rich text together with an optional image, used in sections and pages. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/text) */
export type TextLinkedFromArgs = {
  allowedLocales: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
};

/** Rich text together with an optional image, used in sections and pages. [See type definition](https://app.contentful.com/spaces/nb3rzo39eupw/content_types/text) */
export type TextTextArgs = {
  locale: InputMaybe<Scalars['String']>;
};

export type TextCollection = {
  readonly items: ReadonlyArray<Maybe<Text>>;
  readonly limit: Scalars['Int'];
  readonly skip: Scalars['Int'];
  readonly total: Scalars['Int'];
};

export type TextFilter = {
  readonly AND: InputMaybe<ReadonlyArray<InputMaybe<TextFilter>>>;
  readonly OR: InputMaybe<ReadonlyArray<InputMaybe<TextFilter>>>;
  readonly contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  readonly identifier: InputMaybe<Scalars['String']>;
  readonly identifier_contains: InputMaybe<Scalars['String']>;
  readonly identifier_exists: InputMaybe<Scalars['Boolean']>;
  readonly identifier_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly identifier_not: InputMaybe<Scalars['String']>;
  readonly identifier_not_contains: InputMaybe<Scalars['String']>;
  readonly identifier_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly imageType: InputMaybe<Scalars['String']>;
  readonly imageType_contains: InputMaybe<Scalars['String']>;
  readonly imageType_exists: InputMaybe<Scalars['Boolean']>;
  readonly imageType_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly imageType_not: InputMaybe<Scalars['String']>;
  readonly imageType_not_contains: InputMaybe<Scalars['String']>;
  readonly imageType_not_in: InputMaybe<ReadonlyArray<InputMaybe<Scalars['String']>>>;
  readonly image_exists: InputMaybe<Scalars['Boolean']>;
  readonly sys: InputMaybe<SysFilter>;
  readonly text_contains: InputMaybe<Scalars['String']>;
  readonly text_exists: InputMaybe<Scalars['Boolean']>;
  readonly text_not_contains: InputMaybe<Scalars['String']>;
};

export type TextLinkingCollections = {
  readonly entryCollection: Maybe<EntryCollection>;
};

export type TextLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale: InputMaybe<Scalars['String']>;
  preview: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type TextOrder =
  | 'identifier_ASC'
  | 'identifier_DESC'
  | 'imageType_ASC'
  | 'imageType_DESC'
  | 'sys_firstPublishedAt_ASC'
  | 'sys_firstPublishedAt_DESC'
  | 'sys_id_ASC'
  | 'sys_id_DESC'
  | 'sys_publishedAt_ASC'
  | 'sys_publishedAt_DESC'
  | 'sys_publishedVersion_ASC'
  | 'sys_publishedVersion_DESC';

export type TextText = {
  readonly json: Scalars['JSON'];
  readonly links: TextTextLinks;
};

export type TextTextAssets = {
  readonly block: ReadonlyArray<Maybe<Asset>>;
  readonly hyperlink: ReadonlyArray<Maybe<Asset>>;
};

export type TextTextEntries = {
  readonly block: ReadonlyArray<Maybe<Entry>>;
  readonly hyperlink: ReadonlyArray<Maybe<Entry>>;
  readonly inline: ReadonlyArray<Maybe<Entry>>;
};

export type TextTextLinks = {
  readonly assets: TextTextAssets;
  readonly entries: TextTextEntries;
};

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
