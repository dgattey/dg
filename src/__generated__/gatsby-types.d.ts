/* eslint-disable */

declare namespace GatsbyTypes {
type Maybe<T> = T | undefined;
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
type Scalars = {
  /** The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID. */
  ID: string;
  /** The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
  String: string;
  /** The `Boolean` scalar type represents `true` or `false`. */
  Boolean: boolean;
  /** The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. */
  Int: number;
  /** The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
  Float: number;
  /** A date string, such as 2007-12-03, compliant with the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: string;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: never;
};










type File = Node & {
  readonly sourceInstanceName: Scalars['String'];
  readonly absolutePath: Scalars['String'];
  readonly relativePath: Scalars['String'];
  readonly extension: Scalars['String'];
  readonly size: Scalars['Int'];
  readonly prettySize: Scalars['String'];
  readonly modifiedTime: Scalars['Date'];
  readonly accessTime: Scalars['Date'];
  readonly changeTime: Scalars['Date'];
  readonly birthTime: Scalars['Date'];
  readonly root: Scalars['String'];
  readonly dir: Scalars['String'];
  readonly base: Scalars['String'];
  readonly ext: Scalars['String'];
  readonly name: Scalars['String'];
  readonly relativeDirectory: Scalars['String'];
  readonly dev: Scalars['Int'];
  readonly mode: Scalars['Int'];
  readonly nlink: Scalars['Int'];
  readonly uid: Scalars['Int'];
  readonly gid: Scalars['Int'];
  readonly rdev: Scalars['Int'];
  readonly ino: Scalars['Float'];
  readonly atimeMs: Scalars['Float'];
  readonly mtimeMs: Scalars['Float'];
  readonly ctimeMs: Scalars['Float'];
  readonly atime: Scalars['Date'];
  readonly mtime: Scalars['Date'];
  readonly ctime: Scalars['Date'];
  /** @deprecated Use `birthTime` instead */
  readonly birthtime: Maybe<Scalars['Date']>;
  /** @deprecated Use `birthTime` instead */
  readonly birthtimeMs: Maybe<Scalars['Float']>;
  readonly blksize: Maybe<Scalars['Int']>;
  readonly blocks: Maybe<Scalars['Int']>;
  /** Copy file to static directory and return public url to it */
  readonly publicURL: Maybe<Scalars['String']>;
  /** Returns all children nodes filtered by type ImageSharp */
  readonly childrenImageSharp: Maybe<ReadonlyArray<Maybe<ImageSharp>>>;
  /** Returns the first child node of type ImageSharp or null if there are no children of given type on this node */
  readonly childImageSharp: Maybe<ImageSharp>;
  readonly id: Scalars['ID'];
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
};


type File_modifiedTimeArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type File_accessTimeArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type File_changeTimeArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type File_birthTimeArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type File_atimeArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type File_mtimeArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type File_ctimeArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};

/** Node Interface */
type Node = {
  readonly id: Scalars['ID'];
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
};

type Internal = {
  readonly content: Maybe<Scalars['String']>;
  readonly contentDigest: Scalars['String'];
  readonly description: Maybe<Scalars['String']>;
  readonly fieldOwners: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
  readonly ignoreType: Maybe<Scalars['Boolean']>;
  readonly mediaType: Maybe<Scalars['String']>;
  readonly owner: Scalars['String'];
  readonly type: Scalars['String'];
};


type Directory = Node & {
  readonly sourceInstanceName: Scalars['String'];
  readonly absolutePath: Scalars['String'];
  readonly relativePath: Scalars['String'];
  readonly extension: Scalars['String'];
  readonly size: Scalars['Int'];
  readonly prettySize: Scalars['String'];
  readonly modifiedTime: Scalars['Date'];
  readonly accessTime: Scalars['Date'];
  readonly changeTime: Scalars['Date'];
  readonly birthTime: Scalars['Date'];
  readonly root: Scalars['String'];
  readonly dir: Scalars['String'];
  readonly base: Scalars['String'];
  readonly ext: Scalars['String'];
  readonly name: Scalars['String'];
  readonly relativeDirectory: Scalars['String'];
  readonly dev: Scalars['Int'];
  readonly mode: Scalars['Int'];
  readonly nlink: Scalars['Int'];
  readonly uid: Scalars['Int'];
  readonly gid: Scalars['Int'];
  readonly rdev: Scalars['Int'];
  readonly ino: Scalars['Float'];
  readonly atimeMs: Scalars['Float'];
  readonly mtimeMs: Scalars['Float'];
  readonly ctimeMs: Scalars['Float'];
  readonly atime: Scalars['Date'];
  readonly mtime: Scalars['Date'];
  readonly ctime: Scalars['Date'];
  /** @deprecated Use `birthTime` instead */
  readonly birthtime: Maybe<Scalars['Date']>;
  /** @deprecated Use `birthTime` instead */
  readonly birthtimeMs: Maybe<Scalars['Float']>;
  readonly blksize: Maybe<Scalars['Int']>;
  readonly blocks: Maybe<Scalars['Int']>;
  readonly id: Scalars['ID'];
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
};


type Directory_modifiedTimeArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type Directory_accessTimeArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type Directory_changeTimeArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type Directory_birthTimeArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type Directory_atimeArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type Directory_mtimeArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type Directory_ctimeArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};

type Site = Node & {
  readonly buildTime: Maybe<Scalars['Date']>;
  readonly siteMetadata: Maybe<SiteSiteMetadata>;
  readonly port: Maybe<Scalars['Int']>;
  readonly host: Maybe<Scalars['String']>;
  readonly polyfill: Maybe<Scalars['Boolean']>;
  readonly pathPrefix: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
};


type Site_buildTimeArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};

type SiteSiteMetadata = {
  readonly title: Maybe<Scalars['String']>;
  readonly description: Maybe<Scalars['String']>;
  readonly author: Maybe<Scalars['String']>;
  readonly siteUrl: Maybe<Scalars['String']>;
};

type SitePage = Node & {
  readonly path: Scalars['String'];
  readonly component: Scalars['String'];
  readonly internalComponentName: Scalars['String'];
  readonly componentChunkName: Scalars['String'];
  readonly matchPath: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
  readonly isCreatedByStatefulCreatePages: Maybe<Scalars['Boolean']>;
  readonly context: Maybe<SitePageContext>;
  readonly pluginCreator: Maybe<SitePlugin>;
  readonly pluginCreatorId: Maybe<Scalars['String']>;
  readonly componentPath: Maybe<Scalars['String']>;
};

type SitePageContext = {
  readonly id: Maybe<Scalars['String']>;
};

type ImageFormat =
  | 'NO_CHANGE'
  | 'AUTO'
  | 'jpg'
  | 'png'
  | 'webp'
  | 'avif';

type ImageFit =
  | 'cover'
  | 'contain'
  | 'fill'
  | 'inside'
  | 'outside';

type ImageLayout =
  | 'fixed'
  | 'fullWidth'
  | 'constrained';

type ImageCropFocus =
  | 'CENTER'
  | 1
  | 5
  | 2
  | 6
  | 3
  | 7
  | 4
  | 8
  | 16
  | 17;

type DuotoneGradient = {
  readonly highlight: Scalars['String'];
  readonly shadow: Scalars['String'];
  readonly opacity: Maybe<Scalars['Int']>;
};

type PotraceTurnPolicy =
  | 'black'
  | 'white'
  | 'left'
  | 'right'
  | 'minority'
  | 'majority';

type Potrace = {
  readonly turnPolicy: Maybe<PotraceTurnPolicy>;
  readonly turdSize: Maybe<Scalars['Float']>;
  readonly alphaMax: Maybe<Scalars['Float']>;
  readonly optCurve: Maybe<Scalars['Boolean']>;
  readonly optTolerance: Maybe<Scalars['Float']>;
  readonly threshold: Maybe<Scalars['Int']>;
  readonly blackOnWhite: Maybe<Scalars['Boolean']>;
  readonly color: Maybe<Scalars['String']>;
  readonly background: Maybe<Scalars['String']>;
};

type ImageSharp = Node & {
  readonly fixed: Maybe<ImageSharpFixed>;
  readonly fluid: Maybe<ImageSharpFluid>;
  readonly gatsbyImageData: Scalars['JSON'];
  readonly original: Maybe<ImageSharpOriginal>;
  readonly resize: Maybe<ImageSharpResize>;
  readonly id: Scalars['ID'];
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
};


type ImageSharp_fixedArgs = {
  width: Maybe<Scalars['Int']>;
  height: Maybe<Scalars['Int']>;
  base64Width: Maybe<Scalars['Int']>;
  jpegProgressive?: Maybe<Scalars['Boolean']>;
  pngCompressionSpeed?: Maybe<Scalars['Int']>;
  grayscale?: Maybe<Scalars['Boolean']>;
  duotone: Maybe<DuotoneGradient>;
  traceSVG: Maybe<Potrace>;
  quality: Maybe<Scalars['Int']>;
  jpegQuality: Maybe<Scalars['Int']>;
  pngQuality: Maybe<Scalars['Int']>;
  webpQuality: Maybe<Scalars['Int']>;
  toFormat?: Maybe<ImageFormat>;
  toFormatBase64?: Maybe<ImageFormat>;
  cropFocus?: Maybe<ImageCropFocus>;
  fit?: Maybe<ImageFit>;
  background?: Maybe<Scalars['String']>;
  rotate?: Maybe<Scalars['Int']>;
  trim?: Maybe<Scalars['Float']>;
};


type ImageSharp_fluidArgs = {
  maxWidth: Maybe<Scalars['Int']>;
  maxHeight: Maybe<Scalars['Int']>;
  base64Width: Maybe<Scalars['Int']>;
  grayscale?: Maybe<Scalars['Boolean']>;
  jpegProgressive?: Maybe<Scalars['Boolean']>;
  pngCompressionSpeed?: Maybe<Scalars['Int']>;
  duotone: Maybe<DuotoneGradient>;
  traceSVG: Maybe<Potrace>;
  quality: Maybe<Scalars['Int']>;
  jpegQuality: Maybe<Scalars['Int']>;
  pngQuality: Maybe<Scalars['Int']>;
  webpQuality: Maybe<Scalars['Int']>;
  toFormat?: Maybe<ImageFormat>;
  toFormatBase64?: Maybe<ImageFormat>;
  cropFocus?: Maybe<ImageCropFocus>;
  fit?: Maybe<ImageFit>;
  background?: Maybe<Scalars['String']>;
  rotate?: Maybe<Scalars['Int']>;
  trim?: Maybe<Scalars['Float']>;
  sizes?: Maybe<Scalars['String']>;
  srcSetBreakpoints?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
};


type ImageSharp_gatsbyImageDataArgs = {
  layout?: Maybe<ImageLayout>;
  width: Maybe<Scalars['Int']>;
  height: Maybe<Scalars['Int']>;
  aspectRatio: Maybe<Scalars['Float']>;
  placeholder: Maybe<ImagePlaceholder>;
  blurredOptions: Maybe<BlurredOptions>;
  tracedSVGOptions: Maybe<Potrace>;
  formats: Maybe<ReadonlyArray<Maybe<ImageFormat>>>;
  outputPixelDensities: Maybe<ReadonlyArray<Maybe<Scalars['Float']>>>;
  breakpoints: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
  sizes: Maybe<Scalars['String']>;
  quality: Maybe<Scalars['Int']>;
  jpgOptions: Maybe<JPGOptions>;
  pngOptions: Maybe<PNGOptions>;
  webpOptions: Maybe<WebPOptions>;
  avifOptions: Maybe<AVIFOptions>;
  transformOptions: Maybe<TransformOptions>;
  backgroundColor: Maybe<Scalars['String']>;
};


type ImageSharp_resizeArgs = {
  width: Maybe<Scalars['Int']>;
  height: Maybe<Scalars['Int']>;
  quality: Maybe<Scalars['Int']>;
  jpegQuality: Maybe<Scalars['Int']>;
  pngQuality: Maybe<Scalars['Int']>;
  webpQuality: Maybe<Scalars['Int']>;
  jpegProgressive?: Maybe<Scalars['Boolean']>;
  pngCompressionLevel?: Maybe<Scalars['Int']>;
  pngCompressionSpeed?: Maybe<Scalars['Int']>;
  grayscale?: Maybe<Scalars['Boolean']>;
  duotone: Maybe<DuotoneGradient>;
  base64?: Maybe<Scalars['Boolean']>;
  traceSVG: Maybe<Potrace>;
  toFormat?: Maybe<ImageFormat>;
  cropFocus?: Maybe<ImageCropFocus>;
  fit?: Maybe<ImageFit>;
  background?: Maybe<Scalars['String']>;
  rotate?: Maybe<Scalars['Int']>;
  trim?: Maybe<Scalars['Float']>;
};

type ImageSharpFixed = {
  readonly base64: Maybe<Scalars['String']>;
  readonly tracedSVG: Maybe<Scalars['String']>;
  readonly aspectRatio: Maybe<Scalars['Float']>;
  readonly width: Scalars['Float'];
  readonly height: Scalars['Float'];
  readonly src: Scalars['String'];
  readonly srcSet: Scalars['String'];
  readonly srcWebp: Maybe<Scalars['String']>;
  readonly srcSetWebp: Maybe<Scalars['String']>;
  readonly originalName: Maybe<Scalars['String']>;
};

type ImageSharpFluid = {
  readonly base64: Maybe<Scalars['String']>;
  readonly tracedSVG: Maybe<Scalars['String']>;
  readonly aspectRatio: Scalars['Float'];
  readonly src: Scalars['String'];
  readonly srcSet: Scalars['String'];
  readonly srcWebp: Maybe<Scalars['String']>;
  readonly srcSetWebp: Maybe<Scalars['String']>;
  readonly sizes: Scalars['String'];
  readonly originalImg: Maybe<Scalars['String']>;
  readonly originalName: Maybe<Scalars['String']>;
  readonly presentationWidth: Scalars['Int'];
  readonly presentationHeight: Scalars['Int'];
};


type ImagePlaceholder =
  | 'dominantColor'
  | 'tracedSVG'
  | 'blurred'
  | 'none';

type BlurredOptions = {
  /** Width of the generated low-res preview. Default is 20px */
  readonly width: Maybe<Scalars['Int']>;
  /** Force the output format for the low-res preview. Default is to use the same format as the input. You should rarely need to change this */
  readonly toFormat: Maybe<ImageFormat>;
};

type JPGOptions = {
  readonly quality: Maybe<Scalars['Int']>;
  readonly progressive: Maybe<Scalars['Boolean']>;
};

type PNGOptions = {
  readonly quality: Maybe<Scalars['Int']>;
  readonly compressionSpeed: Maybe<Scalars['Int']>;
};

type WebPOptions = {
  readonly quality: Maybe<Scalars['Int']>;
};

type AVIFOptions = {
  readonly quality: Maybe<Scalars['Int']>;
  readonly lossless: Maybe<Scalars['Boolean']>;
  readonly speed: Maybe<Scalars['Int']>;
};

type TransformOptions = {
  readonly grayscale: Maybe<Scalars['Boolean']>;
  readonly duotone: Maybe<DuotoneGradient>;
  readonly rotate: Maybe<Scalars['Int']>;
  readonly trim: Maybe<Scalars['Float']>;
  readonly cropFocus: Maybe<ImageCropFocus>;
  readonly fit: Maybe<ImageFit>;
};

type ImageSharpOriginal = {
  readonly width: Maybe<Scalars['Float']>;
  readonly height: Maybe<Scalars['Float']>;
  readonly src: Maybe<Scalars['String']>;
};

type ImageSharpResize = {
  readonly src: Maybe<Scalars['String']>;
  readonly tracedSVG: Maybe<Scalars['String']>;
  readonly width: Maybe<Scalars['Int']>;
  readonly height: Maybe<Scalars['Int']>;
  readonly aspectRatio: Maybe<Scalars['Float']>;
  readonly originalName: Maybe<Scalars['String']>;
};

type ContentfulEntry = {
  readonly contentful_id: Scalars['String'];
  readonly id: Scalars['ID'];
  readonly node_locale: Scalars['String'];
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
};

type ContentfulReference = {
  readonly contentful_id: Scalars['String'];
  readonly id: Scalars['ID'];
};

type ContentfulAsset = ContentfulReference & Node & {
  readonly contentful_id: Scalars['String'];
  readonly id: Scalars['ID'];
  readonly spaceId: Maybe<Scalars['String']>;
  readonly createdAt: Maybe<Scalars['Date']>;
  readonly updatedAt: Maybe<Scalars['Date']>;
  readonly file: Maybe<ContentfulAssetFile>;
  readonly title: Maybe<Scalars['String']>;
  readonly description: Maybe<Scalars['String']>;
  readonly node_locale: Maybe<Scalars['String']>;
  readonly sys: Maybe<ContentfulAssetSys>;
  readonly fixed: Maybe<ContentfulFixed>;
  readonly fluid: Maybe<ContentfulFluid>;
  readonly gatsbyImageData: Maybe<Scalars['JSON']>;
  readonly resize: Maybe<ContentfulResize>;
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
};


type ContentfulAsset_createdAtArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type ContentfulAsset_updatedAtArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type ContentfulAsset_fixedArgs = {
  width: Maybe<Scalars['Int']>;
  height: Maybe<Scalars['Int']>;
  quality?: Maybe<Scalars['Int']>;
  toFormat?: Maybe<ContentfulImageFormat>;
  resizingBehavior: Maybe<ImageResizingBehavior>;
  cropFocus?: Maybe<ContentfulImageCropFocus>;
  background?: Maybe<Scalars['String']>;
};


type ContentfulAsset_fluidArgs = {
  maxWidth: Maybe<Scalars['Int']>;
  maxHeight: Maybe<Scalars['Int']>;
  quality?: Maybe<Scalars['Int']>;
  toFormat?: Maybe<ContentfulImageFormat>;
  resizingBehavior: Maybe<ImageResizingBehavior>;
  cropFocus?: Maybe<ContentfulImageCropFocus>;
  background?: Maybe<Scalars['String']>;
  sizes: Maybe<Scalars['String']>;
};


type ContentfulAsset_gatsbyImageDataArgs = {
  layout?: Maybe<ContentfulImageLayout>;
  width: Maybe<Scalars['Int']>;
  height: Maybe<Scalars['Int']>;
  aspectRatio: Maybe<Scalars['Float']>;
  placeholder?: Maybe<ContentfulImagePlaceholder>;
  formats?: Maybe<ReadonlyArray<Maybe<ContentfulImageFormat>>>;
  outputPixelDensities: Maybe<ReadonlyArray<Maybe<Scalars['Float']>>>;
  breakpoints: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
  sizes: Maybe<Scalars['String']>;
  backgroundColor: Maybe<Scalars['String']>;
  jpegProgressive?: Maybe<Scalars['Boolean']>;
  resizingBehavior: Maybe<ImageResizingBehavior>;
  cropFocus: Maybe<ContentfulImageCropFocus>;
  quality?: Maybe<Scalars['Int']>;
};


type ContentfulAsset_resizeArgs = {
  width: Maybe<Scalars['Int']>;
  height: Maybe<Scalars['Int']>;
  quality?: Maybe<Scalars['Int']>;
  jpegProgressive?: Maybe<Scalars['Boolean']>;
  resizingBehavior: Maybe<ImageResizingBehavior>;
  toFormat?: Maybe<ContentfulImageFormat>;
  cropFocus?: Maybe<ContentfulImageCropFocus>;
  background?: Maybe<Scalars['String']>;
};

type ContentfulAssetFile = {
  readonly url: Maybe<Scalars['String']>;
  readonly details: Maybe<ContentfulAssetFileDetails>;
  readonly fileName: Maybe<Scalars['String']>;
  readonly contentType: Maybe<Scalars['String']>;
};

type ContentfulAssetFileDetails = {
  readonly size: Maybe<Scalars['Int']>;
  readonly image: Maybe<ContentfulAssetFileDetailsImage>;
};

type ContentfulAssetFileDetailsImage = {
  readonly width: Maybe<Scalars['Int']>;
  readonly height: Maybe<Scalars['Int']>;
};

type ContentfulAssetSys = {
  readonly type: Maybe<Scalars['String']>;
  readonly revision: Maybe<Scalars['Int']>;
};

type ContentfulFixed = {
  readonly base64: Maybe<Scalars['String']>;
  readonly tracedSVG: Maybe<Scalars['String']>;
  readonly aspectRatio: Maybe<Scalars['Float']>;
  readonly width: Scalars['Float'];
  readonly height: Scalars['Float'];
  readonly src: Scalars['String'];
  readonly srcSet: Scalars['String'];
  readonly srcWebp: Maybe<Scalars['String']>;
  readonly srcSetWebp: Maybe<Scalars['String']>;
};

type ContentfulImageFormat =
  | 'NO_CHANGE'
  | 'AUTO'
  | 'jpg'
  | 'png'
  | 'webp';

type ImageResizingBehavior =
  | 'NO_CHANGE'
  /** Same as the default resizing, but adds padding so that the generated image has the specified dimensions. */
  | 'pad'
  /** Crop a part of the original image to match the specified size. */
  | 'crop'
  /** Crop the image to the specified dimensions, if the original image is smaller than these dimensions, then the image will be upscaled. */
  | 'fill'
  /** When used in association with the f parameter below, creates a thumbnail from the image based on a focus area. */
  | 'thumb'
  /** Scale the image regardless of the original aspect ratio. */
  | 'scale';

type ContentfulImageCropFocus =
  | 'top'
  | 'top_left'
  | 'top_right'
  | 'bottom'
  | 'bottom_left'
  | 'bottom_right'
  | 'right'
  | 'left'
  | 'face'
  | 'faces'
  | 'center';

type ContentfulFluid = {
  readonly base64: Maybe<Scalars['String']>;
  readonly tracedSVG: Maybe<Scalars['String']>;
  readonly aspectRatio: Scalars['Float'];
  readonly src: Scalars['String'];
  readonly srcSet: Scalars['String'];
  readonly srcWebp: Maybe<Scalars['String']>;
  readonly srcSetWebp: Maybe<Scalars['String']>;
  readonly sizes: Scalars['String'];
};

type ContentfulImageLayout =
  | 'fixed'
  | 'fullWidth'
  | 'constrained';

type ContentfulImagePlaceholder =
  | 'dominantColor'
  | 'tracedSVG'
  | 'blurred'
  | 'none';

type ContentfulResize = {
  readonly base64: Maybe<Scalars['String']>;
  readonly tracedSVG: Maybe<Scalars['String']>;
  readonly src: Maybe<Scalars['String']>;
  readonly width: Maybe<Scalars['Int']>;
  readonly height: Maybe<Scalars['Int']>;
  readonly aspectRatio: Maybe<Scalars['Float']>;
};

type ContentfulProject = ContentfulReference & ContentfulEntry & Node & {
  readonly contentful_id: Scalars['String'];
  readonly id: Scalars['ID'];
  readonly node_locale: Scalars['String'];
  readonly title: Maybe<Scalars['String']>;
  readonly creationDate: Maybe<Scalars['Date']>;
  readonly type: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
  readonly description: Maybe<ContentfulProjectDescription>;
  readonly link: Maybe<ContentfulLink>;
  readonly thumbnail: Maybe<ContentfulAsset>;
  readonly section: Maybe<ReadonlyArray<Maybe<ContentfulSection>>>;
  readonly spaceId: Maybe<Scalars['String']>;
  readonly createdAt: Maybe<Scalars['Date']>;
  readonly updatedAt: Maybe<Scalars['Date']>;
  readonly sys: Maybe<ContentfulProjectSys>;
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
};


type ContentfulProject_creationDateArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type ContentfulProject_createdAtArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type ContentfulProject_updatedAtArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};

type ContentfulProjectDescription = {
  readonly raw: Maybe<Scalars['String']>;
};

type ContentfulProjectSys = {
  readonly type: Maybe<Scalars['String']>;
  readonly revision: Maybe<Scalars['Int']>;
  readonly contentType: Maybe<ContentfulProjectSysContentType>;
};

type ContentfulProjectSysContentType = {
  readonly sys: Maybe<ContentfulProjectSysContentTypeSys>;
};

type ContentfulProjectSysContentTypeSys = {
  readonly type: Maybe<Scalars['String']>;
  readonly linkType: Maybe<Scalars['String']>;
  readonly id: Maybe<Scalars['String']>;
};

type ContentfulBook = ContentfulReference & ContentfulEntry & Node & {
  readonly contentful_id: Scalars['String'];
  readonly id: Scalars['ID'];
  readonly node_locale: Scalars['String'];
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
};

type ContentfulLink = ContentfulReference & ContentfulEntry & Node & {
  readonly contentful_id: Scalars['String'];
  readonly id: Scalars['ID'];
  readonly node_locale: Scalars['String'];
  readonly title: Maybe<Scalars['String']>;
  readonly url: Maybe<Scalars['String']>;
  readonly section: Maybe<ReadonlyArray<Maybe<ContentfulSection>>>;
  readonly icon: Maybe<contentfulLinkIconTextNode>;
  readonly spaceId: Maybe<Scalars['String']>;
  readonly createdAt: Maybe<Scalars['Date']>;
  readonly updatedAt: Maybe<Scalars['Date']>;
  readonly sys: Maybe<ContentfulLinkSys>;
  readonly project: Maybe<ReadonlyArray<Maybe<ContentfulProject>>>;
  /** Returns all children nodes filtered by type contentfulLinkIconTextNode */
  readonly childrenContentfulLinkIconTextNode: Maybe<ReadonlyArray<Maybe<contentfulLinkIconTextNode>>>;
  /** Returns the first child node of type contentfulLinkIconTextNode or null if there are no children of given type on this node */
  readonly childContentfulLinkIconTextNode: Maybe<contentfulLinkIconTextNode>;
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
};


type ContentfulLink_createdAtArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type ContentfulLink_updatedAtArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};

type ContentfulLinkSys = {
  readonly type: Maybe<Scalars['String']>;
  readonly revision: Maybe<Scalars['Int']>;
  readonly contentType: Maybe<ContentfulLinkSysContentType>;
};

type ContentfulLinkSysContentType = {
  readonly sys: Maybe<ContentfulLinkSysContentTypeSys>;
};

type ContentfulLinkSysContentTypeSys = {
  readonly type: Maybe<Scalars['String']>;
  readonly linkType: Maybe<Scalars['String']>;
  readonly id: Maybe<Scalars['String']>;
};

type ContentfulPage = ContentfulReference & ContentfulEntry & Node & {
  readonly contentful_id: Scalars['String'];
  readonly id: Scalars['ID'];
  readonly node_locale: Scalars['String'];
  readonly title: Maybe<Scalars['String']>;
  readonly slug: Maybe<Scalars['String']>;
  readonly sections: Maybe<ReadonlyArray<Maybe<ContentfulSectionContentfulTextUnion>>>;
  readonly spaceId: Maybe<Scalars['String']>;
  readonly createdAt: Maybe<Scalars['Date']>;
  readonly updatedAt: Maybe<Scalars['Date']>;
  readonly sys: Maybe<ContentfulPageSys>;
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
};


type ContentfulPage_createdAtArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type ContentfulPage_updatedAtArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};

type ContentfulSectionContentfulTextUnion = ContentfulSection | ContentfulText;

type ContentfulPageSys = {
  readonly type: Maybe<Scalars['String']>;
  readonly contentType: Maybe<ContentfulPageSysContentType>;
  readonly revision: Maybe<Scalars['Int']>;
};

type ContentfulPageSysContentType = {
  readonly sys: Maybe<ContentfulPageSysContentTypeSys>;
};

type ContentfulPageSysContentTypeSys = {
  readonly type: Maybe<Scalars['String']>;
  readonly linkType: Maybe<Scalars['String']>;
  readonly id: Maybe<Scalars['String']>;
};

type ContentfulSection = ContentfulReference & ContentfulEntry & Node & {
  readonly contentful_id: Scalars['String'];
  readonly id: Scalars['ID'];
  readonly node_locale: Scalars['String'];
  readonly title: Maybe<Scalars['String']>;
  readonly blocks: Maybe<ReadonlyArray<Maybe<ContentfulLinkContentfulProjectContentfulSectionUnion>>>;
  readonly spaceId: Maybe<Scalars['String']>;
  readonly createdAt: Maybe<Scalars['Date']>;
  readonly updatedAt: Maybe<Scalars['Date']>;
  readonly sys: Maybe<ContentfulSectionSys>;
  readonly section: Maybe<ReadonlyArray<Maybe<ContentfulSection>>>;
  readonly page: Maybe<ReadonlyArray<Maybe<ContentfulPage>>>;
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
};


type ContentfulSection_createdAtArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type ContentfulSection_updatedAtArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};

type ContentfulLinkContentfulProjectContentfulSectionUnion = ContentfulLink | ContentfulProject | ContentfulSection;

type ContentfulSectionSys = {
  readonly type: Maybe<Scalars['String']>;
  readonly revision: Maybe<Scalars['Int']>;
  readonly contentType: Maybe<ContentfulSectionSysContentType>;
};

type ContentfulSectionSysContentType = {
  readonly sys: Maybe<ContentfulSectionSysContentTypeSys>;
};

type ContentfulSectionSysContentTypeSys = {
  readonly type: Maybe<Scalars['String']>;
  readonly linkType: Maybe<Scalars['String']>;
  readonly id: Maybe<Scalars['String']>;
};

type ContentfulText = ContentfulReference & ContentfulEntry & Node & {
  readonly contentful_id: Scalars['String'];
  readonly id: Scalars['ID'];
  readonly node_locale: Scalars['String'];
  readonly identifier: Maybe<Scalars['String']>;
  readonly text: Maybe<ContentfulTextText>;
  readonly imageType: Maybe<Scalars['String']>;
  readonly page: Maybe<ReadonlyArray<Maybe<ContentfulPage>>>;
  readonly spaceId: Maybe<Scalars['String']>;
  readonly createdAt: Maybe<Scalars['Date']>;
  readonly updatedAt: Maybe<Scalars['Date']>;
  readonly sys: Maybe<ContentfulTextSys>;
  readonly image: Maybe<ContentfulAsset>;
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
};


type ContentfulText_createdAtArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};


type ContentfulText_updatedAtArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};

type ContentfulTextText = {
  readonly raw: Maybe<Scalars['String']>;
};

type ContentfulTextSys = {
  readonly type: Maybe<Scalars['String']>;
  readonly revision: Maybe<Scalars['Int']>;
  readonly contentType: Maybe<ContentfulTextSysContentType>;
};

type ContentfulTextSysContentType = {
  readonly sys: Maybe<ContentfulTextSysContentTypeSys>;
};

type ContentfulTextSysContentTypeSys = {
  readonly type: Maybe<Scalars['String']>;
  readonly linkType: Maybe<Scalars['String']>;
  readonly id: Maybe<Scalars['String']>;
};

type GithubData = Node & {
  readonly id: Scalars['ID'];
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
  readonly data: Maybe<GithubDataData>;
  readonly rawResult: Maybe<GithubDataRawResult>;
};

type GithubDataData = {
  readonly repository: Maybe<GithubDataDataRepository>;
};

type GithubDataDataRepository = {
  readonly refs: Maybe<GithubDataDataRepositoryRefs>;
};

type GithubDataDataRepositoryRefs = {
  readonly nodes: Maybe<ReadonlyArray<Maybe<GithubDataDataRepositoryRefsNodes>>>;
};

type GithubDataDataRepositoryRefsNodes = {
  readonly name: Maybe<Scalars['String']>;
  readonly target: Maybe<GithubDataDataRepositoryRefsNodesTarget>;
};

type GithubDataDataRepositoryRefsNodesTarget = {
  readonly oid: Maybe<Scalars['String']>;
};

type GithubDataRawResult = {
  readonly data: Maybe<GithubDataRawResultData>;
};

type GithubDataRawResultData = {
  readonly repository: Maybe<GithubDataRawResultDataRepository>;
};

type GithubDataRawResultDataRepository = {
  readonly refs: Maybe<GithubDataRawResultDataRepositoryRefs>;
};

type GithubDataRawResultDataRepositoryRefs = {
  readonly nodes: Maybe<ReadonlyArray<Maybe<GithubDataRawResultDataRepositoryRefsNodes>>>;
};

type GithubDataRawResultDataRepositoryRefsNodes = {
  readonly name: Maybe<Scalars['String']>;
  readonly target: Maybe<GithubDataRawResultDataRepositoryRefsNodesTarget>;
};

type GithubDataRawResultDataRepositoryRefsNodesTarget = {
  readonly oid: Maybe<Scalars['String']>;
};

type contentfulLinkIconTextNode = Node & {
  readonly id: Scalars['ID'];
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
  readonly icon: Maybe<Scalars['String']>;
  readonly sys: Maybe<contentfulLinkIconTextNodeSys>;
};

type contentfulLinkIconTextNodeSys = {
  readonly type: Maybe<Scalars['String']>;
};

type ContentfulContentType = Node & {
  readonly id: Scalars['ID'];
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
  readonly name: Maybe<Scalars['String']>;
  readonly displayField: Maybe<Scalars['String']>;
  readonly description: Maybe<Scalars['String']>;
  readonly sys: Maybe<ContentfulContentTypeSys>;
};

type ContentfulContentTypeSys = {
  readonly type: Maybe<Scalars['String']>;
};

type SiteBuildMetadata = Node & {
  readonly id: Scalars['ID'];
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
  readonly buildTime: Maybe<Scalars['Date']>;
};


type SiteBuildMetadata_buildTimeArgs = {
  formatString: Maybe<Scalars['String']>;
  fromNow: Maybe<Scalars['Boolean']>;
  difference: Maybe<Scalars['String']>;
  locale: Maybe<Scalars['String']>;
};

type SitePlugin = Node & {
  readonly id: Scalars['ID'];
  readonly parent: Maybe<Node>;
  readonly children: ReadonlyArray<Node>;
  readonly internal: Internal;
  readonly resolve: Maybe<Scalars['String']>;
  readonly name: Maybe<Scalars['String']>;
  readonly version: Maybe<Scalars['String']>;
  readonly pluginOptions: Maybe<SitePluginPluginOptions>;
  readonly nodeAPIs: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
  readonly browserAPIs: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
  readonly ssrAPIs: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
  readonly pluginFilepath: Maybe<Scalars['String']>;
  readonly packageJson: Maybe<SitePluginPackageJson>;
};

type SitePluginPluginOptions = {
  readonly accessToken: Maybe<Scalars['String']>;
  readonly spaceId: Maybe<Scalars['String']>;
  readonly host: Maybe<Scalars['String']>;
  readonly useNameForId: Maybe<Scalars['Boolean']>;
  readonly environment: Maybe<Scalars['String']>;
  readonly downloadLocal: Maybe<Scalars['Boolean']>;
  readonly forceFullSync: Maybe<Scalars['Boolean']>;
  readonly pageLimit: Maybe<Scalars['Int']>;
  readonly assetDownloadWorkers: Maybe<Scalars['Int']>;
  readonly token: Maybe<Scalars['String']>;
  readonly graphQLQuery: Maybe<Scalars['String']>;
  readonly output: Maybe<Scalars['String']>;
  readonly createLinkInHead: Maybe<Scalars['Boolean']>;
  readonly name: Maybe<Scalars['String']>;
  readonly short_name: Maybe<Scalars['String']>;
  readonly start_url: Maybe<Scalars['String']>;
  readonly background_color: Maybe<Scalars['String']>;
  readonly theme_color: Maybe<Scalars['String']>;
  readonly display: Maybe<Scalars['String']>;
  readonly icon: Maybe<Scalars['String']>;
  readonly legacy: Maybe<Scalars['Boolean']>;
  readonly theme_color_in_head: Maybe<Scalars['Boolean']>;
  readonly cache_busting_mode: Maybe<Scalars['String']>;
  readonly crossOrigin: Maybe<Scalars['String']>;
  readonly include_favicon: Maybe<Scalars['Boolean']>;
  readonly cacheDigest: Maybe<Scalars['String']>;
  readonly base64Width: Maybe<Scalars['Int']>;
  readonly stripMetadata: Maybe<Scalars['Boolean']>;
  readonly defaultQuality: Maybe<Scalars['Int']>;
  readonly failOnError: Maybe<Scalars['Boolean']>;
  readonly path: Maybe<Scalars['String']>;
  readonly outputPath: Maybe<Scalars['String']>;
  readonly configDir: Maybe<Scalars['String']>;
  readonly pathCheck: Maybe<Scalars['Boolean']>;
  readonly allExtensions: Maybe<Scalars['Boolean']>;
  readonly isTSX: Maybe<Scalars['Boolean']>;
  readonly jsxPragma: Maybe<Scalars['String']>;
};

type SitePluginPackageJson = {
  readonly name: Maybe<Scalars['String']>;
  readonly description: Maybe<Scalars['String']>;
  readonly version: Maybe<Scalars['String']>;
  readonly main: Maybe<Scalars['String']>;
  readonly license: Maybe<Scalars['String']>;
  readonly dependencies: Maybe<ReadonlyArray<Maybe<SitePluginPackageJsonDependencies>>>;
  readonly devDependencies: Maybe<ReadonlyArray<Maybe<SitePluginPackageJsonDevDependencies>>>;
  readonly peerDependencies: Maybe<ReadonlyArray<Maybe<SitePluginPackageJsonPeerDependencies>>>;
  readonly keywords: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
};

type SitePluginPackageJsonDependencies = {
  readonly name: Maybe<Scalars['String']>;
  readonly version: Maybe<Scalars['String']>;
};

type SitePluginPackageJsonDevDependencies = {
  readonly name: Maybe<Scalars['String']>;
  readonly version: Maybe<Scalars['String']>;
};

type SitePluginPackageJsonPeerDependencies = {
  readonly name: Maybe<Scalars['String']>;
  readonly version: Maybe<Scalars['String']>;
};

type Query = {
  readonly file: Maybe<File>;
  readonly allFile: FileConnection;
  readonly directory: Maybe<Directory>;
  readonly allDirectory: DirectoryConnection;
  readonly site: Maybe<Site>;
  readonly allSite: SiteConnection;
  readonly sitePage: Maybe<SitePage>;
  readonly allSitePage: SitePageConnection;
  readonly imageSharp: Maybe<ImageSharp>;
  readonly allImageSharp: ImageSharpConnection;
  readonly contentfulEntry: Maybe<ContentfulEntry>;
  readonly allContentfulEntry: ContentfulEntryConnection;
  readonly contentfulAsset: Maybe<ContentfulAsset>;
  readonly allContentfulAsset: ContentfulAssetConnection;
  readonly contentfulProject: Maybe<ContentfulProject>;
  readonly allContentfulProject: ContentfulProjectConnection;
  readonly contentfulBook: Maybe<ContentfulBook>;
  readonly allContentfulBook: ContentfulBookConnection;
  readonly contentfulLink: Maybe<ContentfulLink>;
  readonly allContentfulLink: ContentfulLinkConnection;
  readonly contentfulPage: Maybe<ContentfulPage>;
  readonly allContentfulPage: ContentfulPageConnection;
  readonly contentfulSection: Maybe<ContentfulSection>;
  readonly allContentfulSection: ContentfulSectionConnection;
  readonly contentfulText: Maybe<ContentfulText>;
  readonly allContentfulText: ContentfulTextConnection;
  readonly githubData: Maybe<GithubData>;
  readonly allGithubData: GithubDataConnection;
  readonly contentfulLinkIconTextNode: Maybe<contentfulLinkIconTextNode>;
  readonly allContentfulLinkIconTextNode: contentfulLinkIconTextNodeConnection;
  readonly contentfulContentType: Maybe<ContentfulContentType>;
  readonly allContentfulContentType: ContentfulContentTypeConnection;
  readonly siteBuildMetadata: Maybe<SiteBuildMetadata>;
  readonly allSiteBuildMetadata: SiteBuildMetadataConnection;
  readonly sitePlugin: Maybe<SitePlugin>;
  readonly allSitePlugin: SitePluginConnection;
};


type Query_fileArgs = {
  sourceInstanceName: Maybe<StringQueryOperatorInput>;
  absolutePath: Maybe<StringQueryOperatorInput>;
  relativePath: Maybe<StringQueryOperatorInput>;
  extension: Maybe<StringQueryOperatorInput>;
  size: Maybe<IntQueryOperatorInput>;
  prettySize: Maybe<StringQueryOperatorInput>;
  modifiedTime: Maybe<DateQueryOperatorInput>;
  accessTime: Maybe<DateQueryOperatorInput>;
  changeTime: Maybe<DateQueryOperatorInput>;
  birthTime: Maybe<DateQueryOperatorInput>;
  root: Maybe<StringQueryOperatorInput>;
  dir: Maybe<StringQueryOperatorInput>;
  base: Maybe<StringQueryOperatorInput>;
  ext: Maybe<StringQueryOperatorInput>;
  name: Maybe<StringQueryOperatorInput>;
  relativeDirectory: Maybe<StringQueryOperatorInput>;
  dev: Maybe<IntQueryOperatorInput>;
  mode: Maybe<IntQueryOperatorInput>;
  nlink: Maybe<IntQueryOperatorInput>;
  uid: Maybe<IntQueryOperatorInput>;
  gid: Maybe<IntQueryOperatorInput>;
  rdev: Maybe<IntQueryOperatorInput>;
  ino: Maybe<FloatQueryOperatorInput>;
  atimeMs: Maybe<FloatQueryOperatorInput>;
  mtimeMs: Maybe<FloatQueryOperatorInput>;
  ctimeMs: Maybe<FloatQueryOperatorInput>;
  atime: Maybe<DateQueryOperatorInput>;
  mtime: Maybe<DateQueryOperatorInput>;
  ctime: Maybe<DateQueryOperatorInput>;
  birthtime: Maybe<DateQueryOperatorInput>;
  birthtimeMs: Maybe<FloatQueryOperatorInput>;
  blksize: Maybe<IntQueryOperatorInput>;
  blocks: Maybe<IntQueryOperatorInput>;
  publicURL: Maybe<StringQueryOperatorInput>;
  childrenImageSharp: Maybe<ImageSharpFilterListInput>;
  childImageSharp: Maybe<ImageSharpFilterInput>;
  id: Maybe<StringQueryOperatorInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
};


type Query_allFileArgs = {
  filter: Maybe<FileFilterInput>;
  sort: Maybe<FileSortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_directoryArgs = {
  sourceInstanceName: Maybe<StringQueryOperatorInput>;
  absolutePath: Maybe<StringQueryOperatorInput>;
  relativePath: Maybe<StringQueryOperatorInput>;
  extension: Maybe<StringQueryOperatorInput>;
  size: Maybe<IntQueryOperatorInput>;
  prettySize: Maybe<StringQueryOperatorInput>;
  modifiedTime: Maybe<DateQueryOperatorInput>;
  accessTime: Maybe<DateQueryOperatorInput>;
  changeTime: Maybe<DateQueryOperatorInput>;
  birthTime: Maybe<DateQueryOperatorInput>;
  root: Maybe<StringQueryOperatorInput>;
  dir: Maybe<StringQueryOperatorInput>;
  base: Maybe<StringQueryOperatorInput>;
  ext: Maybe<StringQueryOperatorInput>;
  name: Maybe<StringQueryOperatorInput>;
  relativeDirectory: Maybe<StringQueryOperatorInput>;
  dev: Maybe<IntQueryOperatorInput>;
  mode: Maybe<IntQueryOperatorInput>;
  nlink: Maybe<IntQueryOperatorInput>;
  uid: Maybe<IntQueryOperatorInput>;
  gid: Maybe<IntQueryOperatorInput>;
  rdev: Maybe<IntQueryOperatorInput>;
  ino: Maybe<FloatQueryOperatorInput>;
  atimeMs: Maybe<FloatQueryOperatorInput>;
  mtimeMs: Maybe<FloatQueryOperatorInput>;
  ctimeMs: Maybe<FloatQueryOperatorInput>;
  atime: Maybe<DateQueryOperatorInput>;
  mtime: Maybe<DateQueryOperatorInput>;
  ctime: Maybe<DateQueryOperatorInput>;
  birthtime: Maybe<DateQueryOperatorInput>;
  birthtimeMs: Maybe<FloatQueryOperatorInput>;
  blksize: Maybe<IntQueryOperatorInput>;
  blocks: Maybe<IntQueryOperatorInput>;
  id: Maybe<StringQueryOperatorInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
};


type Query_allDirectoryArgs = {
  filter: Maybe<DirectoryFilterInput>;
  sort: Maybe<DirectorySortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_siteArgs = {
  buildTime: Maybe<DateQueryOperatorInput>;
  siteMetadata: Maybe<SiteSiteMetadataFilterInput>;
  port: Maybe<IntQueryOperatorInput>;
  host: Maybe<StringQueryOperatorInput>;
  polyfill: Maybe<BooleanQueryOperatorInput>;
  pathPrefix: Maybe<StringQueryOperatorInput>;
  id: Maybe<StringQueryOperatorInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
};


type Query_allSiteArgs = {
  filter: Maybe<SiteFilterInput>;
  sort: Maybe<SiteSortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_sitePageArgs = {
  path: Maybe<StringQueryOperatorInput>;
  component: Maybe<StringQueryOperatorInput>;
  internalComponentName: Maybe<StringQueryOperatorInput>;
  componentChunkName: Maybe<StringQueryOperatorInput>;
  matchPath: Maybe<StringQueryOperatorInput>;
  id: Maybe<StringQueryOperatorInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
  isCreatedByStatefulCreatePages: Maybe<BooleanQueryOperatorInput>;
  context: Maybe<SitePageContextFilterInput>;
  pluginCreator: Maybe<SitePluginFilterInput>;
  pluginCreatorId: Maybe<StringQueryOperatorInput>;
  componentPath: Maybe<StringQueryOperatorInput>;
};


type Query_allSitePageArgs = {
  filter: Maybe<SitePageFilterInput>;
  sort: Maybe<SitePageSortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_imageSharpArgs = {
  fixed: Maybe<ImageSharpFixedFilterInput>;
  fluid: Maybe<ImageSharpFluidFilterInput>;
  gatsbyImageData: Maybe<JSONQueryOperatorInput>;
  original: Maybe<ImageSharpOriginalFilterInput>;
  resize: Maybe<ImageSharpResizeFilterInput>;
  id: Maybe<StringQueryOperatorInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
};


type Query_allImageSharpArgs = {
  filter: Maybe<ImageSharpFilterInput>;
  sort: Maybe<ImageSharpSortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_contentfulEntryArgs = {
  contentful_id: Maybe<StringQueryOperatorInput>;
  id: Maybe<StringQueryOperatorInput>;
  node_locale: Maybe<StringQueryOperatorInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
};


type Query_allContentfulEntryArgs = {
  filter: Maybe<ContentfulEntryFilterInput>;
  sort: Maybe<ContentfulEntrySortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_contentfulAssetArgs = {
  contentful_id: Maybe<StringQueryOperatorInput>;
  id: Maybe<StringQueryOperatorInput>;
  spaceId: Maybe<StringQueryOperatorInput>;
  createdAt: Maybe<DateQueryOperatorInput>;
  updatedAt: Maybe<DateQueryOperatorInput>;
  file: Maybe<ContentfulAssetFileFilterInput>;
  title: Maybe<StringQueryOperatorInput>;
  description: Maybe<StringQueryOperatorInput>;
  node_locale: Maybe<StringQueryOperatorInput>;
  sys: Maybe<ContentfulAssetSysFilterInput>;
  fixed: Maybe<ContentfulFixedFilterInput>;
  fluid: Maybe<ContentfulFluidFilterInput>;
  gatsbyImageData: Maybe<JSONQueryOperatorInput>;
  resize: Maybe<ContentfulResizeFilterInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
};


type Query_allContentfulAssetArgs = {
  filter: Maybe<ContentfulAssetFilterInput>;
  sort: Maybe<ContentfulAssetSortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_contentfulProjectArgs = {
  contentful_id: Maybe<StringQueryOperatorInput>;
  id: Maybe<StringQueryOperatorInput>;
  node_locale: Maybe<StringQueryOperatorInput>;
  title: Maybe<StringQueryOperatorInput>;
  creationDate: Maybe<DateQueryOperatorInput>;
  type: Maybe<StringQueryOperatorInput>;
  description: Maybe<ContentfulProjectDescriptionFilterInput>;
  link: Maybe<ContentfulLinkFilterInput>;
  thumbnail: Maybe<ContentfulAssetFilterInput>;
  section: Maybe<ContentfulSectionFilterListInput>;
  spaceId: Maybe<StringQueryOperatorInput>;
  createdAt: Maybe<DateQueryOperatorInput>;
  updatedAt: Maybe<DateQueryOperatorInput>;
  sys: Maybe<ContentfulProjectSysFilterInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
};


type Query_allContentfulProjectArgs = {
  filter: Maybe<ContentfulProjectFilterInput>;
  sort: Maybe<ContentfulProjectSortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_contentfulBookArgs = {
  contentful_id: Maybe<StringQueryOperatorInput>;
  id: Maybe<StringQueryOperatorInput>;
  node_locale: Maybe<StringQueryOperatorInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
};


type Query_allContentfulBookArgs = {
  filter: Maybe<ContentfulBookFilterInput>;
  sort: Maybe<ContentfulBookSortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_contentfulLinkArgs = {
  contentful_id: Maybe<StringQueryOperatorInput>;
  id: Maybe<StringQueryOperatorInput>;
  node_locale: Maybe<StringQueryOperatorInput>;
  title: Maybe<StringQueryOperatorInput>;
  url: Maybe<StringQueryOperatorInput>;
  section: Maybe<ContentfulSectionFilterListInput>;
  icon: Maybe<contentfulLinkIconTextNodeFilterInput>;
  spaceId: Maybe<StringQueryOperatorInput>;
  createdAt: Maybe<DateQueryOperatorInput>;
  updatedAt: Maybe<DateQueryOperatorInput>;
  sys: Maybe<ContentfulLinkSysFilterInput>;
  project: Maybe<ContentfulProjectFilterListInput>;
  childrenContentfulLinkIconTextNode: Maybe<contentfulLinkIconTextNodeFilterListInput>;
  childContentfulLinkIconTextNode: Maybe<contentfulLinkIconTextNodeFilterInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
};


type Query_allContentfulLinkArgs = {
  filter: Maybe<ContentfulLinkFilterInput>;
  sort: Maybe<ContentfulLinkSortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_contentfulPageArgs = {
  contentful_id: Maybe<StringQueryOperatorInput>;
  id: Maybe<StringQueryOperatorInput>;
  node_locale: Maybe<StringQueryOperatorInput>;
  title: Maybe<StringQueryOperatorInput>;
  slug: Maybe<StringQueryOperatorInput>;
  spaceId: Maybe<StringQueryOperatorInput>;
  createdAt: Maybe<DateQueryOperatorInput>;
  updatedAt: Maybe<DateQueryOperatorInput>;
  sys: Maybe<ContentfulPageSysFilterInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
};


type Query_allContentfulPageArgs = {
  filter: Maybe<ContentfulPageFilterInput>;
  sort: Maybe<ContentfulPageSortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_contentfulSectionArgs = {
  contentful_id: Maybe<StringQueryOperatorInput>;
  id: Maybe<StringQueryOperatorInput>;
  node_locale: Maybe<StringQueryOperatorInput>;
  title: Maybe<StringQueryOperatorInput>;
  spaceId: Maybe<StringQueryOperatorInput>;
  createdAt: Maybe<DateQueryOperatorInput>;
  updatedAt: Maybe<DateQueryOperatorInput>;
  sys: Maybe<ContentfulSectionSysFilterInput>;
  section: Maybe<ContentfulSectionFilterListInput>;
  page: Maybe<ContentfulPageFilterListInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
};


type Query_allContentfulSectionArgs = {
  filter: Maybe<ContentfulSectionFilterInput>;
  sort: Maybe<ContentfulSectionSortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_contentfulTextArgs = {
  contentful_id: Maybe<StringQueryOperatorInput>;
  id: Maybe<StringQueryOperatorInput>;
  node_locale: Maybe<StringQueryOperatorInput>;
  identifier: Maybe<StringQueryOperatorInput>;
  text: Maybe<ContentfulTextTextFilterInput>;
  imageType: Maybe<StringQueryOperatorInput>;
  page: Maybe<ContentfulPageFilterListInput>;
  spaceId: Maybe<StringQueryOperatorInput>;
  createdAt: Maybe<DateQueryOperatorInput>;
  updatedAt: Maybe<DateQueryOperatorInput>;
  sys: Maybe<ContentfulTextSysFilterInput>;
  image: Maybe<ContentfulAssetFilterInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
};


type Query_allContentfulTextArgs = {
  filter: Maybe<ContentfulTextFilterInput>;
  sort: Maybe<ContentfulTextSortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_githubDataArgs = {
  id: Maybe<StringQueryOperatorInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
  data: Maybe<GithubDataDataFilterInput>;
  rawResult: Maybe<GithubDataRawResultFilterInput>;
};


type Query_allGithubDataArgs = {
  filter: Maybe<GithubDataFilterInput>;
  sort: Maybe<GithubDataSortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_contentfulLinkIconTextNodeArgs = {
  id: Maybe<StringQueryOperatorInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
  icon: Maybe<StringQueryOperatorInput>;
  sys: Maybe<contentfulLinkIconTextNodeSysFilterInput>;
};


type Query_allContentfulLinkIconTextNodeArgs = {
  filter: Maybe<contentfulLinkIconTextNodeFilterInput>;
  sort: Maybe<contentfulLinkIconTextNodeSortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_contentfulContentTypeArgs = {
  id: Maybe<StringQueryOperatorInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
  name: Maybe<StringQueryOperatorInput>;
  displayField: Maybe<StringQueryOperatorInput>;
  description: Maybe<StringQueryOperatorInput>;
  sys: Maybe<ContentfulContentTypeSysFilterInput>;
};


type Query_allContentfulContentTypeArgs = {
  filter: Maybe<ContentfulContentTypeFilterInput>;
  sort: Maybe<ContentfulContentTypeSortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_siteBuildMetadataArgs = {
  id: Maybe<StringQueryOperatorInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
  buildTime: Maybe<DateQueryOperatorInput>;
};


type Query_allSiteBuildMetadataArgs = {
  filter: Maybe<SiteBuildMetadataFilterInput>;
  sort: Maybe<SiteBuildMetadataSortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};


type Query_sitePluginArgs = {
  id: Maybe<StringQueryOperatorInput>;
  parent: Maybe<NodeFilterInput>;
  children: Maybe<NodeFilterListInput>;
  internal: Maybe<InternalFilterInput>;
  resolve: Maybe<StringQueryOperatorInput>;
  name: Maybe<StringQueryOperatorInput>;
  version: Maybe<StringQueryOperatorInput>;
  pluginOptions: Maybe<SitePluginPluginOptionsFilterInput>;
  nodeAPIs: Maybe<StringQueryOperatorInput>;
  browserAPIs: Maybe<StringQueryOperatorInput>;
  ssrAPIs: Maybe<StringQueryOperatorInput>;
  pluginFilepath: Maybe<StringQueryOperatorInput>;
  packageJson: Maybe<SitePluginPackageJsonFilterInput>;
};


type Query_allSitePluginArgs = {
  filter: Maybe<SitePluginFilterInput>;
  sort: Maybe<SitePluginSortInput>;
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
};

type StringQueryOperatorInput = {
  readonly eq: Maybe<Scalars['String']>;
  readonly ne: Maybe<Scalars['String']>;
  readonly in: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
  readonly nin: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
  readonly regex: Maybe<Scalars['String']>;
  readonly glob: Maybe<Scalars['String']>;
};

type IntQueryOperatorInput = {
  readonly eq: Maybe<Scalars['Int']>;
  readonly ne: Maybe<Scalars['Int']>;
  readonly gt: Maybe<Scalars['Int']>;
  readonly gte: Maybe<Scalars['Int']>;
  readonly lt: Maybe<Scalars['Int']>;
  readonly lte: Maybe<Scalars['Int']>;
  readonly in: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
  readonly nin: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
};

type DateQueryOperatorInput = {
  readonly eq: Maybe<Scalars['Date']>;
  readonly ne: Maybe<Scalars['Date']>;
  readonly gt: Maybe<Scalars['Date']>;
  readonly gte: Maybe<Scalars['Date']>;
  readonly lt: Maybe<Scalars['Date']>;
  readonly lte: Maybe<Scalars['Date']>;
  readonly in: Maybe<ReadonlyArray<Maybe<Scalars['Date']>>>;
  readonly nin: Maybe<ReadonlyArray<Maybe<Scalars['Date']>>>;
};

type FloatQueryOperatorInput = {
  readonly eq: Maybe<Scalars['Float']>;
  readonly ne: Maybe<Scalars['Float']>;
  readonly gt: Maybe<Scalars['Float']>;
  readonly gte: Maybe<Scalars['Float']>;
  readonly lt: Maybe<Scalars['Float']>;
  readonly lte: Maybe<Scalars['Float']>;
  readonly in: Maybe<ReadonlyArray<Maybe<Scalars['Float']>>>;
  readonly nin: Maybe<ReadonlyArray<Maybe<Scalars['Float']>>>;
};

type ImageSharpFilterListInput = {
  readonly elemMatch: Maybe<ImageSharpFilterInput>;
};

type ImageSharpFilterInput = {
  readonly fixed: Maybe<ImageSharpFixedFilterInput>;
  readonly fluid: Maybe<ImageSharpFluidFilterInput>;
  readonly gatsbyImageData: Maybe<JSONQueryOperatorInput>;
  readonly original: Maybe<ImageSharpOriginalFilterInput>;
  readonly resize: Maybe<ImageSharpResizeFilterInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
};

type ImageSharpFixedFilterInput = {
  readonly base64: Maybe<StringQueryOperatorInput>;
  readonly tracedSVG: Maybe<StringQueryOperatorInput>;
  readonly aspectRatio: Maybe<FloatQueryOperatorInput>;
  readonly width: Maybe<FloatQueryOperatorInput>;
  readonly height: Maybe<FloatQueryOperatorInput>;
  readonly src: Maybe<StringQueryOperatorInput>;
  readonly srcSet: Maybe<StringQueryOperatorInput>;
  readonly srcWebp: Maybe<StringQueryOperatorInput>;
  readonly srcSetWebp: Maybe<StringQueryOperatorInput>;
  readonly originalName: Maybe<StringQueryOperatorInput>;
};

type ImageSharpFluidFilterInput = {
  readonly base64: Maybe<StringQueryOperatorInput>;
  readonly tracedSVG: Maybe<StringQueryOperatorInput>;
  readonly aspectRatio: Maybe<FloatQueryOperatorInput>;
  readonly src: Maybe<StringQueryOperatorInput>;
  readonly srcSet: Maybe<StringQueryOperatorInput>;
  readonly srcWebp: Maybe<StringQueryOperatorInput>;
  readonly srcSetWebp: Maybe<StringQueryOperatorInput>;
  readonly sizes: Maybe<StringQueryOperatorInput>;
  readonly originalImg: Maybe<StringQueryOperatorInput>;
  readonly originalName: Maybe<StringQueryOperatorInput>;
  readonly presentationWidth: Maybe<IntQueryOperatorInput>;
  readonly presentationHeight: Maybe<IntQueryOperatorInput>;
};

type JSONQueryOperatorInput = {
  readonly eq: Maybe<Scalars['JSON']>;
  readonly ne: Maybe<Scalars['JSON']>;
  readonly in: Maybe<ReadonlyArray<Maybe<Scalars['JSON']>>>;
  readonly nin: Maybe<ReadonlyArray<Maybe<Scalars['JSON']>>>;
  readonly regex: Maybe<Scalars['JSON']>;
  readonly glob: Maybe<Scalars['JSON']>;
};

type ImageSharpOriginalFilterInput = {
  readonly width: Maybe<FloatQueryOperatorInput>;
  readonly height: Maybe<FloatQueryOperatorInput>;
  readonly src: Maybe<StringQueryOperatorInput>;
};

type ImageSharpResizeFilterInput = {
  readonly src: Maybe<StringQueryOperatorInput>;
  readonly tracedSVG: Maybe<StringQueryOperatorInput>;
  readonly width: Maybe<IntQueryOperatorInput>;
  readonly height: Maybe<IntQueryOperatorInput>;
  readonly aspectRatio: Maybe<FloatQueryOperatorInput>;
  readonly originalName: Maybe<StringQueryOperatorInput>;
};

type NodeFilterInput = {
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
};

type NodeFilterListInput = {
  readonly elemMatch: Maybe<NodeFilterInput>;
};

type InternalFilterInput = {
  readonly content: Maybe<StringQueryOperatorInput>;
  readonly contentDigest: Maybe<StringQueryOperatorInput>;
  readonly description: Maybe<StringQueryOperatorInput>;
  readonly fieldOwners: Maybe<StringQueryOperatorInput>;
  readonly ignoreType: Maybe<BooleanQueryOperatorInput>;
  readonly mediaType: Maybe<StringQueryOperatorInput>;
  readonly owner: Maybe<StringQueryOperatorInput>;
  readonly type: Maybe<StringQueryOperatorInput>;
};

type BooleanQueryOperatorInput = {
  readonly eq: Maybe<Scalars['Boolean']>;
  readonly ne: Maybe<Scalars['Boolean']>;
  readonly in: Maybe<ReadonlyArray<Maybe<Scalars['Boolean']>>>;
  readonly nin: Maybe<ReadonlyArray<Maybe<Scalars['Boolean']>>>;
};

type FileConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<FileEdge>;
  readonly nodes: ReadonlyArray<File>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<FileGroupConnection>;
};


type FileConnection_distinctArgs = {
  field: FileFieldsEnum;
};


type FileConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: FileFieldsEnum;
};

type FileEdge = {
  readonly next: Maybe<File>;
  readonly node: File;
  readonly previous: Maybe<File>;
};

type PageInfo = {
  readonly currentPage: Scalars['Int'];
  readonly hasPreviousPage: Scalars['Boolean'];
  readonly hasNextPage: Scalars['Boolean'];
  readonly itemCount: Scalars['Int'];
  readonly pageCount: Scalars['Int'];
  readonly perPage: Maybe<Scalars['Int']>;
  readonly totalCount: Scalars['Int'];
};

type FileFieldsEnum =
  | 'sourceInstanceName'
  | 'absolutePath'
  | 'relativePath'
  | 'extension'
  | 'size'
  | 'prettySize'
  | 'modifiedTime'
  | 'accessTime'
  | 'changeTime'
  | 'birthTime'
  | 'root'
  | 'dir'
  | 'base'
  | 'ext'
  | 'name'
  | 'relativeDirectory'
  | 'dev'
  | 'mode'
  | 'nlink'
  | 'uid'
  | 'gid'
  | 'rdev'
  | 'ino'
  | 'atimeMs'
  | 'mtimeMs'
  | 'ctimeMs'
  | 'atime'
  | 'mtime'
  | 'ctime'
  | 'birthtime'
  | 'birthtimeMs'
  | 'blksize'
  | 'blocks'
  | 'publicURL'
  | 'childrenImageSharp'
  | 'childrenImageSharp.fixed.base64'
  | 'childrenImageSharp.fixed.tracedSVG'
  | 'childrenImageSharp.fixed.aspectRatio'
  | 'childrenImageSharp.fixed.width'
  | 'childrenImageSharp.fixed.height'
  | 'childrenImageSharp.fixed.src'
  | 'childrenImageSharp.fixed.srcSet'
  | 'childrenImageSharp.fixed.srcWebp'
  | 'childrenImageSharp.fixed.srcSetWebp'
  | 'childrenImageSharp.fixed.originalName'
  | 'childrenImageSharp.fluid.base64'
  | 'childrenImageSharp.fluid.tracedSVG'
  | 'childrenImageSharp.fluid.aspectRatio'
  | 'childrenImageSharp.fluid.src'
  | 'childrenImageSharp.fluid.srcSet'
  | 'childrenImageSharp.fluid.srcWebp'
  | 'childrenImageSharp.fluid.srcSetWebp'
  | 'childrenImageSharp.fluid.sizes'
  | 'childrenImageSharp.fluid.originalImg'
  | 'childrenImageSharp.fluid.originalName'
  | 'childrenImageSharp.fluid.presentationWidth'
  | 'childrenImageSharp.fluid.presentationHeight'
  | 'childrenImageSharp.gatsbyImageData'
  | 'childrenImageSharp.original.width'
  | 'childrenImageSharp.original.height'
  | 'childrenImageSharp.original.src'
  | 'childrenImageSharp.resize.src'
  | 'childrenImageSharp.resize.tracedSVG'
  | 'childrenImageSharp.resize.width'
  | 'childrenImageSharp.resize.height'
  | 'childrenImageSharp.resize.aspectRatio'
  | 'childrenImageSharp.resize.originalName'
  | 'childrenImageSharp.id'
  | 'childrenImageSharp.parent.id'
  | 'childrenImageSharp.parent.parent.id'
  | 'childrenImageSharp.parent.parent.children'
  | 'childrenImageSharp.parent.children'
  | 'childrenImageSharp.parent.children.id'
  | 'childrenImageSharp.parent.children.children'
  | 'childrenImageSharp.parent.internal.content'
  | 'childrenImageSharp.parent.internal.contentDigest'
  | 'childrenImageSharp.parent.internal.description'
  | 'childrenImageSharp.parent.internal.fieldOwners'
  | 'childrenImageSharp.parent.internal.ignoreType'
  | 'childrenImageSharp.parent.internal.mediaType'
  | 'childrenImageSharp.parent.internal.owner'
  | 'childrenImageSharp.parent.internal.type'
  | 'childrenImageSharp.children'
  | 'childrenImageSharp.children.id'
  | 'childrenImageSharp.children.parent.id'
  | 'childrenImageSharp.children.parent.children'
  | 'childrenImageSharp.children.children'
  | 'childrenImageSharp.children.children.id'
  | 'childrenImageSharp.children.children.children'
  | 'childrenImageSharp.children.internal.content'
  | 'childrenImageSharp.children.internal.contentDigest'
  | 'childrenImageSharp.children.internal.description'
  | 'childrenImageSharp.children.internal.fieldOwners'
  | 'childrenImageSharp.children.internal.ignoreType'
  | 'childrenImageSharp.children.internal.mediaType'
  | 'childrenImageSharp.children.internal.owner'
  | 'childrenImageSharp.children.internal.type'
  | 'childrenImageSharp.internal.content'
  | 'childrenImageSharp.internal.contentDigest'
  | 'childrenImageSharp.internal.description'
  | 'childrenImageSharp.internal.fieldOwners'
  | 'childrenImageSharp.internal.ignoreType'
  | 'childrenImageSharp.internal.mediaType'
  | 'childrenImageSharp.internal.owner'
  | 'childrenImageSharp.internal.type'
  | 'childImageSharp.fixed.base64'
  | 'childImageSharp.fixed.tracedSVG'
  | 'childImageSharp.fixed.aspectRatio'
  | 'childImageSharp.fixed.width'
  | 'childImageSharp.fixed.height'
  | 'childImageSharp.fixed.src'
  | 'childImageSharp.fixed.srcSet'
  | 'childImageSharp.fixed.srcWebp'
  | 'childImageSharp.fixed.srcSetWebp'
  | 'childImageSharp.fixed.originalName'
  | 'childImageSharp.fluid.base64'
  | 'childImageSharp.fluid.tracedSVG'
  | 'childImageSharp.fluid.aspectRatio'
  | 'childImageSharp.fluid.src'
  | 'childImageSharp.fluid.srcSet'
  | 'childImageSharp.fluid.srcWebp'
  | 'childImageSharp.fluid.srcSetWebp'
  | 'childImageSharp.fluid.sizes'
  | 'childImageSharp.fluid.originalImg'
  | 'childImageSharp.fluid.originalName'
  | 'childImageSharp.fluid.presentationWidth'
  | 'childImageSharp.fluid.presentationHeight'
  | 'childImageSharp.gatsbyImageData'
  | 'childImageSharp.original.width'
  | 'childImageSharp.original.height'
  | 'childImageSharp.original.src'
  | 'childImageSharp.resize.src'
  | 'childImageSharp.resize.tracedSVG'
  | 'childImageSharp.resize.width'
  | 'childImageSharp.resize.height'
  | 'childImageSharp.resize.aspectRatio'
  | 'childImageSharp.resize.originalName'
  | 'childImageSharp.id'
  | 'childImageSharp.parent.id'
  | 'childImageSharp.parent.parent.id'
  | 'childImageSharp.parent.parent.children'
  | 'childImageSharp.parent.children'
  | 'childImageSharp.parent.children.id'
  | 'childImageSharp.parent.children.children'
  | 'childImageSharp.parent.internal.content'
  | 'childImageSharp.parent.internal.contentDigest'
  | 'childImageSharp.parent.internal.description'
  | 'childImageSharp.parent.internal.fieldOwners'
  | 'childImageSharp.parent.internal.ignoreType'
  | 'childImageSharp.parent.internal.mediaType'
  | 'childImageSharp.parent.internal.owner'
  | 'childImageSharp.parent.internal.type'
  | 'childImageSharp.children'
  | 'childImageSharp.children.id'
  | 'childImageSharp.children.parent.id'
  | 'childImageSharp.children.parent.children'
  | 'childImageSharp.children.children'
  | 'childImageSharp.children.children.id'
  | 'childImageSharp.children.children.children'
  | 'childImageSharp.children.internal.content'
  | 'childImageSharp.children.internal.contentDigest'
  | 'childImageSharp.children.internal.description'
  | 'childImageSharp.children.internal.fieldOwners'
  | 'childImageSharp.children.internal.ignoreType'
  | 'childImageSharp.children.internal.mediaType'
  | 'childImageSharp.children.internal.owner'
  | 'childImageSharp.children.internal.type'
  | 'childImageSharp.internal.content'
  | 'childImageSharp.internal.contentDigest'
  | 'childImageSharp.internal.description'
  | 'childImageSharp.internal.fieldOwners'
  | 'childImageSharp.internal.ignoreType'
  | 'childImageSharp.internal.mediaType'
  | 'childImageSharp.internal.owner'
  | 'childImageSharp.internal.type'
  | 'id'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type';

type FileGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<FileEdge>;
  readonly nodes: ReadonlyArray<File>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type FileFilterInput = {
  readonly sourceInstanceName: Maybe<StringQueryOperatorInput>;
  readonly absolutePath: Maybe<StringQueryOperatorInput>;
  readonly relativePath: Maybe<StringQueryOperatorInput>;
  readonly extension: Maybe<StringQueryOperatorInput>;
  readonly size: Maybe<IntQueryOperatorInput>;
  readonly prettySize: Maybe<StringQueryOperatorInput>;
  readonly modifiedTime: Maybe<DateQueryOperatorInput>;
  readonly accessTime: Maybe<DateQueryOperatorInput>;
  readonly changeTime: Maybe<DateQueryOperatorInput>;
  readonly birthTime: Maybe<DateQueryOperatorInput>;
  readonly root: Maybe<StringQueryOperatorInput>;
  readonly dir: Maybe<StringQueryOperatorInput>;
  readonly base: Maybe<StringQueryOperatorInput>;
  readonly ext: Maybe<StringQueryOperatorInput>;
  readonly name: Maybe<StringQueryOperatorInput>;
  readonly relativeDirectory: Maybe<StringQueryOperatorInput>;
  readonly dev: Maybe<IntQueryOperatorInput>;
  readonly mode: Maybe<IntQueryOperatorInput>;
  readonly nlink: Maybe<IntQueryOperatorInput>;
  readonly uid: Maybe<IntQueryOperatorInput>;
  readonly gid: Maybe<IntQueryOperatorInput>;
  readonly rdev: Maybe<IntQueryOperatorInput>;
  readonly ino: Maybe<FloatQueryOperatorInput>;
  readonly atimeMs: Maybe<FloatQueryOperatorInput>;
  readonly mtimeMs: Maybe<FloatQueryOperatorInput>;
  readonly ctimeMs: Maybe<FloatQueryOperatorInput>;
  readonly atime: Maybe<DateQueryOperatorInput>;
  readonly mtime: Maybe<DateQueryOperatorInput>;
  readonly ctime: Maybe<DateQueryOperatorInput>;
  readonly birthtime: Maybe<DateQueryOperatorInput>;
  readonly birthtimeMs: Maybe<FloatQueryOperatorInput>;
  readonly blksize: Maybe<IntQueryOperatorInput>;
  readonly blocks: Maybe<IntQueryOperatorInput>;
  readonly publicURL: Maybe<StringQueryOperatorInput>;
  readonly childrenImageSharp: Maybe<ImageSharpFilterListInput>;
  readonly childImageSharp: Maybe<ImageSharpFilterInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
};

type FileSortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<FileFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type SortOrderEnum =
  | 'ASC'
  | 'DESC';

type DirectoryConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<DirectoryEdge>;
  readonly nodes: ReadonlyArray<Directory>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<DirectoryGroupConnection>;
};


type DirectoryConnection_distinctArgs = {
  field: DirectoryFieldsEnum;
};


type DirectoryConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: DirectoryFieldsEnum;
};

type DirectoryEdge = {
  readonly next: Maybe<Directory>;
  readonly node: Directory;
  readonly previous: Maybe<Directory>;
};

type DirectoryFieldsEnum =
  | 'sourceInstanceName'
  | 'absolutePath'
  | 'relativePath'
  | 'extension'
  | 'size'
  | 'prettySize'
  | 'modifiedTime'
  | 'accessTime'
  | 'changeTime'
  | 'birthTime'
  | 'root'
  | 'dir'
  | 'base'
  | 'ext'
  | 'name'
  | 'relativeDirectory'
  | 'dev'
  | 'mode'
  | 'nlink'
  | 'uid'
  | 'gid'
  | 'rdev'
  | 'ino'
  | 'atimeMs'
  | 'mtimeMs'
  | 'ctimeMs'
  | 'atime'
  | 'mtime'
  | 'ctime'
  | 'birthtime'
  | 'birthtimeMs'
  | 'blksize'
  | 'blocks'
  | 'id'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type';

type DirectoryGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<DirectoryEdge>;
  readonly nodes: ReadonlyArray<Directory>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type DirectoryFilterInput = {
  readonly sourceInstanceName: Maybe<StringQueryOperatorInput>;
  readonly absolutePath: Maybe<StringQueryOperatorInput>;
  readonly relativePath: Maybe<StringQueryOperatorInput>;
  readonly extension: Maybe<StringQueryOperatorInput>;
  readonly size: Maybe<IntQueryOperatorInput>;
  readonly prettySize: Maybe<StringQueryOperatorInput>;
  readonly modifiedTime: Maybe<DateQueryOperatorInput>;
  readonly accessTime: Maybe<DateQueryOperatorInput>;
  readonly changeTime: Maybe<DateQueryOperatorInput>;
  readonly birthTime: Maybe<DateQueryOperatorInput>;
  readonly root: Maybe<StringQueryOperatorInput>;
  readonly dir: Maybe<StringQueryOperatorInput>;
  readonly base: Maybe<StringQueryOperatorInput>;
  readonly ext: Maybe<StringQueryOperatorInput>;
  readonly name: Maybe<StringQueryOperatorInput>;
  readonly relativeDirectory: Maybe<StringQueryOperatorInput>;
  readonly dev: Maybe<IntQueryOperatorInput>;
  readonly mode: Maybe<IntQueryOperatorInput>;
  readonly nlink: Maybe<IntQueryOperatorInput>;
  readonly uid: Maybe<IntQueryOperatorInput>;
  readonly gid: Maybe<IntQueryOperatorInput>;
  readonly rdev: Maybe<IntQueryOperatorInput>;
  readonly ino: Maybe<FloatQueryOperatorInput>;
  readonly atimeMs: Maybe<FloatQueryOperatorInput>;
  readonly mtimeMs: Maybe<FloatQueryOperatorInput>;
  readonly ctimeMs: Maybe<FloatQueryOperatorInput>;
  readonly atime: Maybe<DateQueryOperatorInput>;
  readonly mtime: Maybe<DateQueryOperatorInput>;
  readonly ctime: Maybe<DateQueryOperatorInput>;
  readonly birthtime: Maybe<DateQueryOperatorInput>;
  readonly birthtimeMs: Maybe<FloatQueryOperatorInput>;
  readonly blksize: Maybe<IntQueryOperatorInput>;
  readonly blocks: Maybe<IntQueryOperatorInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
};

type DirectorySortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<DirectoryFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type SiteSiteMetadataFilterInput = {
  readonly title: Maybe<StringQueryOperatorInput>;
  readonly description: Maybe<StringQueryOperatorInput>;
  readonly author: Maybe<StringQueryOperatorInput>;
  readonly siteUrl: Maybe<StringQueryOperatorInput>;
};

type SiteConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<SiteEdge>;
  readonly nodes: ReadonlyArray<Site>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<SiteGroupConnection>;
};


type SiteConnection_distinctArgs = {
  field: SiteFieldsEnum;
};


type SiteConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: SiteFieldsEnum;
};

type SiteEdge = {
  readonly next: Maybe<Site>;
  readonly node: Site;
  readonly previous: Maybe<Site>;
};

type SiteFieldsEnum =
  | 'buildTime'
  | 'siteMetadata.title'
  | 'siteMetadata.description'
  | 'siteMetadata.author'
  | 'siteMetadata.siteUrl'
  | 'port'
  | 'host'
  | 'polyfill'
  | 'pathPrefix'
  | 'id'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type';

type SiteGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<SiteEdge>;
  readonly nodes: ReadonlyArray<Site>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type SiteFilterInput = {
  readonly buildTime: Maybe<DateQueryOperatorInput>;
  readonly siteMetadata: Maybe<SiteSiteMetadataFilterInput>;
  readonly port: Maybe<IntQueryOperatorInput>;
  readonly host: Maybe<StringQueryOperatorInput>;
  readonly polyfill: Maybe<BooleanQueryOperatorInput>;
  readonly pathPrefix: Maybe<StringQueryOperatorInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
};

type SiteSortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<SiteFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type SitePageContextFilterInput = {
  readonly id: Maybe<StringQueryOperatorInput>;
};

type SitePluginFilterInput = {
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
  readonly resolve: Maybe<StringQueryOperatorInput>;
  readonly name: Maybe<StringQueryOperatorInput>;
  readonly version: Maybe<StringQueryOperatorInput>;
  readonly pluginOptions: Maybe<SitePluginPluginOptionsFilterInput>;
  readonly nodeAPIs: Maybe<StringQueryOperatorInput>;
  readonly browserAPIs: Maybe<StringQueryOperatorInput>;
  readonly ssrAPIs: Maybe<StringQueryOperatorInput>;
  readonly pluginFilepath: Maybe<StringQueryOperatorInput>;
  readonly packageJson: Maybe<SitePluginPackageJsonFilterInput>;
};

type SitePluginPluginOptionsFilterInput = {
  readonly accessToken: Maybe<StringQueryOperatorInput>;
  readonly spaceId: Maybe<StringQueryOperatorInput>;
  readonly host: Maybe<StringQueryOperatorInput>;
  readonly useNameForId: Maybe<BooleanQueryOperatorInput>;
  readonly environment: Maybe<StringQueryOperatorInput>;
  readonly downloadLocal: Maybe<BooleanQueryOperatorInput>;
  readonly forceFullSync: Maybe<BooleanQueryOperatorInput>;
  readonly pageLimit: Maybe<IntQueryOperatorInput>;
  readonly assetDownloadWorkers: Maybe<IntQueryOperatorInput>;
  readonly token: Maybe<StringQueryOperatorInput>;
  readonly graphQLQuery: Maybe<StringQueryOperatorInput>;
  readonly output: Maybe<StringQueryOperatorInput>;
  readonly createLinkInHead: Maybe<BooleanQueryOperatorInput>;
  readonly name: Maybe<StringQueryOperatorInput>;
  readonly short_name: Maybe<StringQueryOperatorInput>;
  readonly start_url: Maybe<StringQueryOperatorInput>;
  readonly background_color: Maybe<StringQueryOperatorInput>;
  readonly theme_color: Maybe<StringQueryOperatorInput>;
  readonly display: Maybe<StringQueryOperatorInput>;
  readonly icon: Maybe<StringQueryOperatorInput>;
  readonly legacy: Maybe<BooleanQueryOperatorInput>;
  readonly theme_color_in_head: Maybe<BooleanQueryOperatorInput>;
  readonly cache_busting_mode: Maybe<StringQueryOperatorInput>;
  readonly crossOrigin: Maybe<StringQueryOperatorInput>;
  readonly include_favicon: Maybe<BooleanQueryOperatorInput>;
  readonly cacheDigest: Maybe<StringQueryOperatorInput>;
  readonly base64Width: Maybe<IntQueryOperatorInput>;
  readonly stripMetadata: Maybe<BooleanQueryOperatorInput>;
  readonly defaultQuality: Maybe<IntQueryOperatorInput>;
  readonly failOnError: Maybe<BooleanQueryOperatorInput>;
  readonly path: Maybe<StringQueryOperatorInput>;
  readonly outputPath: Maybe<StringQueryOperatorInput>;
  readonly configDir: Maybe<StringQueryOperatorInput>;
  readonly pathCheck: Maybe<BooleanQueryOperatorInput>;
  readonly allExtensions: Maybe<BooleanQueryOperatorInput>;
  readonly isTSX: Maybe<BooleanQueryOperatorInput>;
  readonly jsxPragma: Maybe<StringQueryOperatorInput>;
};

type SitePluginPackageJsonFilterInput = {
  readonly name: Maybe<StringQueryOperatorInput>;
  readonly description: Maybe<StringQueryOperatorInput>;
  readonly version: Maybe<StringQueryOperatorInput>;
  readonly main: Maybe<StringQueryOperatorInput>;
  readonly license: Maybe<StringQueryOperatorInput>;
  readonly dependencies: Maybe<SitePluginPackageJsonDependenciesFilterListInput>;
  readonly devDependencies: Maybe<SitePluginPackageJsonDevDependenciesFilterListInput>;
  readonly peerDependencies: Maybe<SitePluginPackageJsonPeerDependenciesFilterListInput>;
  readonly keywords: Maybe<StringQueryOperatorInput>;
};

type SitePluginPackageJsonDependenciesFilterListInput = {
  readonly elemMatch: Maybe<SitePluginPackageJsonDependenciesFilterInput>;
};

type SitePluginPackageJsonDependenciesFilterInput = {
  readonly name: Maybe<StringQueryOperatorInput>;
  readonly version: Maybe<StringQueryOperatorInput>;
};

type SitePluginPackageJsonDevDependenciesFilterListInput = {
  readonly elemMatch: Maybe<SitePluginPackageJsonDevDependenciesFilterInput>;
};

type SitePluginPackageJsonDevDependenciesFilterInput = {
  readonly name: Maybe<StringQueryOperatorInput>;
  readonly version: Maybe<StringQueryOperatorInput>;
};

type SitePluginPackageJsonPeerDependenciesFilterListInput = {
  readonly elemMatch: Maybe<SitePluginPackageJsonPeerDependenciesFilterInput>;
};

type SitePluginPackageJsonPeerDependenciesFilterInput = {
  readonly name: Maybe<StringQueryOperatorInput>;
  readonly version: Maybe<StringQueryOperatorInput>;
};

type SitePageConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<SitePageEdge>;
  readonly nodes: ReadonlyArray<SitePage>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<SitePageGroupConnection>;
};


type SitePageConnection_distinctArgs = {
  field: SitePageFieldsEnum;
};


type SitePageConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: SitePageFieldsEnum;
};

type SitePageEdge = {
  readonly next: Maybe<SitePage>;
  readonly node: SitePage;
  readonly previous: Maybe<SitePage>;
};

type SitePageFieldsEnum =
  | 'path'
  | 'component'
  | 'internalComponentName'
  | 'componentChunkName'
  | 'matchPath'
  | 'id'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type'
  | 'isCreatedByStatefulCreatePages'
  | 'context.id'
  | 'pluginCreator.id'
  | 'pluginCreator.parent.id'
  | 'pluginCreator.parent.parent.id'
  | 'pluginCreator.parent.parent.children'
  | 'pluginCreator.parent.children'
  | 'pluginCreator.parent.children.id'
  | 'pluginCreator.parent.children.children'
  | 'pluginCreator.parent.internal.content'
  | 'pluginCreator.parent.internal.contentDigest'
  | 'pluginCreator.parent.internal.description'
  | 'pluginCreator.parent.internal.fieldOwners'
  | 'pluginCreator.parent.internal.ignoreType'
  | 'pluginCreator.parent.internal.mediaType'
  | 'pluginCreator.parent.internal.owner'
  | 'pluginCreator.parent.internal.type'
  | 'pluginCreator.children'
  | 'pluginCreator.children.id'
  | 'pluginCreator.children.parent.id'
  | 'pluginCreator.children.parent.children'
  | 'pluginCreator.children.children'
  | 'pluginCreator.children.children.id'
  | 'pluginCreator.children.children.children'
  | 'pluginCreator.children.internal.content'
  | 'pluginCreator.children.internal.contentDigest'
  | 'pluginCreator.children.internal.description'
  | 'pluginCreator.children.internal.fieldOwners'
  | 'pluginCreator.children.internal.ignoreType'
  | 'pluginCreator.children.internal.mediaType'
  | 'pluginCreator.children.internal.owner'
  | 'pluginCreator.children.internal.type'
  | 'pluginCreator.internal.content'
  | 'pluginCreator.internal.contentDigest'
  | 'pluginCreator.internal.description'
  | 'pluginCreator.internal.fieldOwners'
  | 'pluginCreator.internal.ignoreType'
  | 'pluginCreator.internal.mediaType'
  | 'pluginCreator.internal.owner'
  | 'pluginCreator.internal.type'
  | 'pluginCreator.resolve'
  | 'pluginCreator.name'
  | 'pluginCreator.version'
  | 'pluginCreator.pluginOptions.accessToken'
  | 'pluginCreator.pluginOptions.spaceId'
  | 'pluginCreator.pluginOptions.host'
  | 'pluginCreator.pluginOptions.useNameForId'
  | 'pluginCreator.pluginOptions.environment'
  | 'pluginCreator.pluginOptions.downloadLocal'
  | 'pluginCreator.pluginOptions.forceFullSync'
  | 'pluginCreator.pluginOptions.pageLimit'
  | 'pluginCreator.pluginOptions.assetDownloadWorkers'
  | 'pluginCreator.pluginOptions.token'
  | 'pluginCreator.pluginOptions.graphQLQuery'
  | 'pluginCreator.pluginOptions.output'
  | 'pluginCreator.pluginOptions.createLinkInHead'
  | 'pluginCreator.pluginOptions.name'
  | 'pluginCreator.pluginOptions.short_name'
  | 'pluginCreator.pluginOptions.start_url'
  | 'pluginCreator.pluginOptions.background_color'
  | 'pluginCreator.pluginOptions.theme_color'
  | 'pluginCreator.pluginOptions.display'
  | 'pluginCreator.pluginOptions.icon'
  | 'pluginCreator.pluginOptions.legacy'
  | 'pluginCreator.pluginOptions.theme_color_in_head'
  | 'pluginCreator.pluginOptions.cache_busting_mode'
  | 'pluginCreator.pluginOptions.crossOrigin'
  | 'pluginCreator.pluginOptions.include_favicon'
  | 'pluginCreator.pluginOptions.cacheDigest'
  | 'pluginCreator.pluginOptions.base64Width'
  | 'pluginCreator.pluginOptions.stripMetadata'
  | 'pluginCreator.pluginOptions.defaultQuality'
  | 'pluginCreator.pluginOptions.failOnError'
  | 'pluginCreator.pluginOptions.path'
  | 'pluginCreator.pluginOptions.outputPath'
  | 'pluginCreator.pluginOptions.configDir'
  | 'pluginCreator.pluginOptions.pathCheck'
  | 'pluginCreator.pluginOptions.allExtensions'
  | 'pluginCreator.pluginOptions.isTSX'
  | 'pluginCreator.pluginOptions.jsxPragma'
  | 'pluginCreator.nodeAPIs'
  | 'pluginCreator.browserAPIs'
  | 'pluginCreator.ssrAPIs'
  | 'pluginCreator.pluginFilepath'
  | 'pluginCreator.packageJson.name'
  | 'pluginCreator.packageJson.description'
  | 'pluginCreator.packageJson.version'
  | 'pluginCreator.packageJson.main'
  | 'pluginCreator.packageJson.license'
  | 'pluginCreator.packageJson.dependencies'
  | 'pluginCreator.packageJson.dependencies.name'
  | 'pluginCreator.packageJson.dependencies.version'
  | 'pluginCreator.packageJson.devDependencies'
  | 'pluginCreator.packageJson.devDependencies.name'
  | 'pluginCreator.packageJson.devDependencies.version'
  | 'pluginCreator.packageJson.peerDependencies'
  | 'pluginCreator.packageJson.peerDependencies.name'
  | 'pluginCreator.packageJson.peerDependencies.version'
  | 'pluginCreator.packageJson.keywords'
  | 'pluginCreatorId'
  | 'componentPath';

type SitePageGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<SitePageEdge>;
  readonly nodes: ReadonlyArray<SitePage>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type SitePageFilterInput = {
  readonly path: Maybe<StringQueryOperatorInput>;
  readonly component: Maybe<StringQueryOperatorInput>;
  readonly internalComponentName: Maybe<StringQueryOperatorInput>;
  readonly componentChunkName: Maybe<StringQueryOperatorInput>;
  readonly matchPath: Maybe<StringQueryOperatorInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
  readonly isCreatedByStatefulCreatePages: Maybe<BooleanQueryOperatorInput>;
  readonly context: Maybe<SitePageContextFilterInput>;
  readonly pluginCreator: Maybe<SitePluginFilterInput>;
  readonly pluginCreatorId: Maybe<StringQueryOperatorInput>;
  readonly componentPath: Maybe<StringQueryOperatorInput>;
};

type SitePageSortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<SitePageFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type ImageSharpConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ImageSharpEdge>;
  readonly nodes: ReadonlyArray<ImageSharp>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<ImageSharpGroupConnection>;
};


type ImageSharpConnection_distinctArgs = {
  field: ImageSharpFieldsEnum;
};


type ImageSharpConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: ImageSharpFieldsEnum;
};

type ImageSharpEdge = {
  readonly next: Maybe<ImageSharp>;
  readonly node: ImageSharp;
  readonly previous: Maybe<ImageSharp>;
};

type ImageSharpFieldsEnum =
  | 'fixed.base64'
  | 'fixed.tracedSVG'
  | 'fixed.aspectRatio'
  | 'fixed.width'
  | 'fixed.height'
  | 'fixed.src'
  | 'fixed.srcSet'
  | 'fixed.srcWebp'
  | 'fixed.srcSetWebp'
  | 'fixed.originalName'
  | 'fluid.base64'
  | 'fluid.tracedSVG'
  | 'fluid.aspectRatio'
  | 'fluid.src'
  | 'fluid.srcSet'
  | 'fluid.srcWebp'
  | 'fluid.srcSetWebp'
  | 'fluid.sizes'
  | 'fluid.originalImg'
  | 'fluid.originalName'
  | 'fluid.presentationWidth'
  | 'fluid.presentationHeight'
  | 'gatsbyImageData'
  | 'original.width'
  | 'original.height'
  | 'original.src'
  | 'resize.src'
  | 'resize.tracedSVG'
  | 'resize.width'
  | 'resize.height'
  | 'resize.aspectRatio'
  | 'resize.originalName'
  | 'id'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type';

type ImageSharpGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ImageSharpEdge>;
  readonly nodes: ReadonlyArray<ImageSharp>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type ImageSharpSortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<ImageSharpFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type ContentfulEntryConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulEntryEdge>;
  readonly nodes: ReadonlyArray<ContentfulEntry>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<ContentfulEntryGroupConnection>;
};


type ContentfulEntryConnection_distinctArgs = {
  field: ContentfulEntryFieldsEnum;
};


type ContentfulEntryConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: ContentfulEntryFieldsEnum;
};

type ContentfulEntryEdge = {
  readonly next: Maybe<ContentfulEntry>;
  readonly node: ContentfulEntry;
  readonly previous: Maybe<ContentfulEntry>;
};

type ContentfulEntryFieldsEnum =
  | 'contentful_id'
  | 'id'
  | 'node_locale'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type';

type ContentfulEntryGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulEntryEdge>;
  readonly nodes: ReadonlyArray<ContentfulEntry>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type ContentfulEntryFilterInput = {
  readonly contentful_id: Maybe<StringQueryOperatorInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly node_locale: Maybe<StringQueryOperatorInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
};

type ContentfulEntrySortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<ContentfulEntryFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type ContentfulAssetFileFilterInput = {
  readonly url: Maybe<StringQueryOperatorInput>;
  readonly details: Maybe<ContentfulAssetFileDetailsFilterInput>;
  readonly fileName: Maybe<StringQueryOperatorInput>;
  readonly contentType: Maybe<StringQueryOperatorInput>;
};

type ContentfulAssetFileDetailsFilterInput = {
  readonly size: Maybe<IntQueryOperatorInput>;
  readonly image: Maybe<ContentfulAssetFileDetailsImageFilterInput>;
};

type ContentfulAssetFileDetailsImageFilterInput = {
  readonly width: Maybe<IntQueryOperatorInput>;
  readonly height: Maybe<IntQueryOperatorInput>;
};

type ContentfulAssetSysFilterInput = {
  readonly type: Maybe<StringQueryOperatorInput>;
  readonly revision: Maybe<IntQueryOperatorInput>;
};

type ContentfulFixedFilterInput = {
  readonly base64: Maybe<StringQueryOperatorInput>;
  readonly tracedSVG: Maybe<StringQueryOperatorInput>;
  readonly aspectRatio: Maybe<FloatQueryOperatorInput>;
  readonly width: Maybe<FloatQueryOperatorInput>;
  readonly height: Maybe<FloatQueryOperatorInput>;
  readonly src: Maybe<StringQueryOperatorInput>;
  readonly srcSet: Maybe<StringQueryOperatorInput>;
  readonly srcWebp: Maybe<StringQueryOperatorInput>;
  readonly srcSetWebp: Maybe<StringQueryOperatorInput>;
};

type ContentfulFluidFilterInput = {
  readonly base64: Maybe<StringQueryOperatorInput>;
  readonly tracedSVG: Maybe<StringQueryOperatorInput>;
  readonly aspectRatio: Maybe<FloatQueryOperatorInput>;
  readonly src: Maybe<StringQueryOperatorInput>;
  readonly srcSet: Maybe<StringQueryOperatorInput>;
  readonly srcWebp: Maybe<StringQueryOperatorInput>;
  readonly srcSetWebp: Maybe<StringQueryOperatorInput>;
  readonly sizes: Maybe<StringQueryOperatorInput>;
};

type ContentfulResizeFilterInput = {
  readonly base64: Maybe<StringQueryOperatorInput>;
  readonly tracedSVG: Maybe<StringQueryOperatorInput>;
  readonly src: Maybe<StringQueryOperatorInput>;
  readonly width: Maybe<IntQueryOperatorInput>;
  readonly height: Maybe<IntQueryOperatorInput>;
  readonly aspectRatio: Maybe<FloatQueryOperatorInput>;
};

type ContentfulAssetConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulAssetEdge>;
  readonly nodes: ReadonlyArray<ContentfulAsset>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<ContentfulAssetGroupConnection>;
};


type ContentfulAssetConnection_distinctArgs = {
  field: ContentfulAssetFieldsEnum;
};


type ContentfulAssetConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: ContentfulAssetFieldsEnum;
};

type ContentfulAssetEdge = {
  readonly next: Maybe<ContentfulAsset>;
  readonly node: ContentfulAsset;
  readonly previous: Maybe<ContentfulAsset>;
};

type ContentfulAssetFieldsEnum =
  | 'contentful_id'
  | 'id'
  | 'spaceId'
  | 'createdAt'
  | 'updatedAt'
  | 'file.url'
  | 'file.details.size'
  | 'file.details.image.width'
  | 'file.details.image.height'
  | 'file.fileName'
  | 'file.contentType'
  | 'title'
  | 'description'
  | 'node_locale'
  | 'sys.type'
  | 'sys.revision'
  | 'fixed.base64'
  | 'fixed.tracedSVG'
  | 'fixed.aspectRatio'
  | 'fixed.width'
  | 'fixed.height'
  | 'fixed.src'
  | 'fixed.srcSet'
  | 'fixed.srcWebp'
  | 'fixed.srcSetWebp'
  | 'fluid.base64'
  | 'fluid.tracedSVG'
  | 'fluid.aspectRatio'
  | 'fluid.src'
  | 'fluid.srcSet'
  | 'fluid.srcWebp'
  | 'fluid.srcSetWebp'
  | 'fluid.sizes'
  | 'gatsbyImageData'
  | 'resize.base64'
  | 'resize.tracedSVG'
  | 'resize.src'
  | 'resize.width'
  | 'resize.height'
  | 'resize.aspectRatio'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type';

type ContentfulAssetGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulAssetEdge>;
  readonly nodes: ReadonlyArray<ContentfulAsset>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type ContentfulAssetFilterInput = {
  readonly contentful_id: Maybe<StringQueryOperatorInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly spaceId: Maybe<StringQueryOperatorInput>;
  readonly createdAt: Maybe<DateQueryOperatorInput>;
  readonly updatedAt: Maybe<DateQueryOperatorInput>;
  readonly file: Maybe<ContentfulAssetFileFilterInput>;
  readonly title: Maybe<StringQueryOperatorInput>;
  readonly description: Maybe<StringQueryOperatorInput>;
  readonly node_locale: Maybe<StringQueryOperatorInput>;
  readonly sys: Maybe<ContentfulAssetSysFilterInput>;
  readonly fixed: Maybe<ContentfulFixedFilterInput>;
  readonly fluid: Maybe<ContentfulFluidFilterInput>;
  readonly gatsbyImageData: Maybe<JSONQueryOperatorInput>;
  readonly resize: Maybe<ContentfulResizeFilterInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
};

type ContentfulAssetSortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<ContentfulAssetFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type ContentfulProjectDescriptionFilterInput = {
  readonly raw: Maybe<StringQueryOperatorInput>;
};

type ContentfulLinkFilterInput = {
  readonly contentful_id: Maybe<StringQueryOperatorInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly node_locale: Maybe<StringQueryOperatorInput>;
  readonly title: Maybe<StringQueryOperatorInput>;
  readonly url: Maybe<StringQueryOperatorInput>;
  readonly section: Maybe<ContentfulSectionFilterListInput>;
  readonly icon: Maybe<contentfulLinkIconTextNodeFilterInput>;
  readonly spaceId: Maybe<StringQueryOperatorInput>;
  readonly createdAt: Maybe<DateQueryOperatorInput>;
  readonly updatedAt: Maybe<DateQueryOperatorInput>;
  readonly sys: Maybe<ContentfulLinkSysFilterInput>;
  readonly project: Maybe<ContentfulProjectFilterListInput>;
  readonly childrenContentfulLinkIconTextNode: Maybe<contentfulLinkIconTextNodeFilterListInput>;
  readonly childContentfulLinkIconTextNode: Maybe<contentfulLinkIconTextNodeFilterInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
};

type ContentfulSectionFilterListInput = {
  readonly elemMatch: Maybe<ContentfulSectionFilterInput>;
};

type ContentfulSectionFilterInput = {
  readonly contentful_id: Maybe<StringQueryOperatorInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly node_locale: Maybe<StringQueryOperatorInput>;
  readonly title: Maybe<StringQueryOperatorInput>;
  readonly spaceId: Maybe<StringQueryOperatorInput>;
  readonly createdAt: Maybe<DateQueryOperatorInput>;
  readonly updatedAt: Maybe<DateQueryOperatorInput>;
  readonly sys: Maybe<ContentfulSectionSysFilterInput>;
  readonly section: Maybe<ContentfulSectionFilterListInput>;
  readonly page: Maybe<ContentfulPageFilterListInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
};

type ContentfulSectionSysFilterInput = {
  readonly type: Maybe<StringQueryOperatorInput>;
  readonly revision: Maybe<IntQueryOperatorInput>;
  readonly contentType: Maybe<ContentfulSectionSysContentTypeFilterInput>;
};

type ContentfulSectionSysContentTypeFilterInput = {
  readonly sys: Maybe<ContentfulSectionSysContentTypeSysFilterInput>;
};

type ContentfulSectionSysContentTypeSysFilterInput = {
  readonly type: Maybe<StringQueryOperatorInput>;
  readonly linkType: Maybe<StringQueryOperatorInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
};

type ContentfulPageFilterListInput = {
  readonly elemMatch: Maybe<ContentfulPageFilterInput>;
};

type ContentfulPageFilterInput = {
  readonly contentful_id: Maybe<StringQueryOperatorInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly node_locale: Maybe<StringQueryOperatorInput>;
  readonly title: Maybe<StringQueryOperatorInput>;
  readonly slug: Maybe<StringQueryOperatorInput>;
  readonly spaceId: Maybe<StringQueryOperatorInput>;
  readonly createdAt: Maybe<DateQueryOperatorInput>;
  readonly updatedAt: Maybe<DateQueryOperatorInput>;
  readonly sys: Maybe<ContentfulPageSysFilterInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
};

type ContentfulPageSysFilterInput = {
  readonly type: Maybe<StringQueryOperatorInput>;
  readonly contentType: Maybe<ContentfulPageSysContentTypeFilterInput>;
  readonly revision: Maybe<IntQueryOperatorInput>;
};

type ContentfulPageSysContentTypeFilterInput = {
  readonly sys: Maybe<ContentfulPageSysContentTypeSysFilterInput>;
};

type ContentfulPageSysContentTypeSysFilterInput = {
  readonly type: Maybe<StringQueryOperatorInput>;
  readonly linkType: Maybe<StringQueryOperatorInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
};

type contentfulLinkIconTextNodeFilterInput = {
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
  readonly icon: Maybe<StringQueryOperatorInput>;
  readonly sys: Maybe<contentfulLinkIconTextNodeSysFilterInput>;
};

type contentfulLinkIconTextNodeSysFilterInput = {
  readonly type: Maybe<StringQueryOperatorInput>;
};

type ContentfulLinkSysFilterInput = {
  readonly type: Maybe<StringQueryOperatorInput>;
  readonly revision: Maybe<IntQueryOperatorInput>;
  readonly contentType: Maybe<ContentfulLinkSysContentTypeFilterInput>;
};

type ContentfulLinkSysContentTypeFilterInput = {
  readonly sys: Maybe<ContentfulLinkSysContentTypeSysFilterInput>;
};

type ContentfulLinkSysContentTypeSysFilterInput = {
  readonly type: Maybe<StringQueryOperatorInput>;
  readonly linkType: Maybe<StringQueryOperatorInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
};

type ContentfulProjectFilterListInput = {
  readonly elemMatch: Maybe<ContentfulProjectFilterInput>;
};

type ContentfulProjectFilterInput = {
  readonly contentful_id: Maybe<StringQueryOperatorInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly node_locale: Maybe<StringQueryOperatorInput>;
  readonly title: Maybe<StringQueryOperatorInput>;
  readonly creationDate: Maybe<DateQueryOperatorInput>;
  readonly type: Maybe<StringQueryOperatorInput>;
  readonly description: Maybe<ContentfulProjectDescriptionFilterInput>;
  readonly link: Maybe<ContentfulLinkFilterInput>;
  readonly thumbnail: Maybe<ContentfulAssetFilterInput>;
  readonly section: Maybe<ContentfulSectionFilterListInput>;
  readonly spaceId: Maybe<StringQueryOperatorInput>;
  readonly createdAt: Maybe<DateQueryOperatorInput>;
  readonly updatedAt: Maybe<DateQueryOperatorInput>;
  readonly sys: Maybe<ContentfulProjectSysFilterInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
};

type ContentfulProjectSysFilterInput = {
  readonly type: Maybe<StringQueryOperatorInput>;
  readonly revision: Maybe<IntQueryOperatorInput>;
  readonly contentType: Maybe<ContentfulProjectSysContentTypeFilterInput>;
};

type ContentfulProjectSysContentTypeFilterInput = {
  readonly sys: Maybe<ContentfulProjectSysContentTypeSysFilterInput>;
};

type ContentfulProjectSysContentTypeSysFilterInput = {
  readonly type: Maybe<StringQueryOperatorInput>;
  readonly linkType: Maybe<StringQueryOperatorInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
};

type contentfulLinkIconTextNodeFilterListInput = {
  readonly elemMatch: Maybe<contentfulLinkIconTextNodeFilterInput>;
};

type ContentfulProjectConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulProjectEdge>;
  readonly nodes: ReadonlyArray<ContentfulProject>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<ContentfulProjectGroupConnection>;
};


type ContentfulProjectConnection_distinctArgs = {
  field: ContentfulProjectFieldsEnum;
};


type ContentfulProjectConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: ContentfulProjectFieldsEnum;
};

type ContentfulProjectEdge = {
  readonly next: Maybe<ContentfulProject>;
  readonly node: ContentfulProject;
  readonly previous: Maybe<ContentfulProject>;
};

type ContentfulProjectFieldsEnum =
  | 'contentful_id'
  | 'id'
  | 'node_locale'
  | 'title'
  | 'creationDate'
  | 'type'
  | 'description.raw'
  | 'link.contentful_id'
  | 'link.id'
  | 'link.node_locale'
  | 'link.title'
  | 'link.url'
  | 'link.section'
  | 'link.section.contentful_id'
  | 'link.section.id'
  | 'link.section.node_locale'
  | 'link.section.title'
  | 'link.section.spaceId'
  | 'link.section.createdAt'
  | 'link.section.updatedAt'
  | 'link.section.sys.type'
  | 'link.section.sys.revision'
  | 'link.section.section'
  | 'link.section.section.contentful_id'
  | 'link.section.section.id'
  | 'link.section.section.node_locale'
  | 'link.section.section.title'
  | 'link.section.section.spaceId'
  | 'link.section.section.createdAt'
  | 'link.section.section.updatedAt'
  | 'link.section.section.section'
  | 'link.section.section.page'
  | 'link.section.section.children'
  | 'link.section.page'
  | 'link.section.page.contentful_id'
  | 'link.section.page.id'
  | 'link.section.page.node_locale'
  | 'link.section.page.title'
  | 'link.section.page.slug'
  | 'link.section.page.spaceId'
  | 'link.section.page.createdAt'
  | 'link.section.page.updatedAt'
  | 'link.section.page.children'
  | 'link.section.parent.id'
  | 'link.section.parent.children'
  | 'link.section.children'
  | 'link.section.children.id'
  | 'link.section.children.children'
  | 'link.section.internal.content'
  | 'link.section.internal.contentDigest'
  | 'link.section.internal.description'
  | 'link.section.internal.fieldOwners'
  | 'link.section.internal.ignoreType'
  | 'link.section.internal.mediaType'
  | 'link.section.internal.owner'
  | 'link.section.internal.type'
  | 'link.icon.id'
  | 'link.icon.parent.id'
  | 'link.icon.parent.children'
  | 'link.icon.children'
  | 'link.icon.children.id'
  | 'link.icon.children.children'
  | 'link.icon.internal.content'
  | 'link.icon.internal.contentDigest'
  | 'link.icon.internal.description'
  | 'link.icon.internal.fieldOwners'
  | 'link.icon.internal.ignoreType'
  | 'link.icon.internal.mediaType'
  | 'link.icon.internal.owner'
  | 'link.icon.internal.type'
  | 'link.icon.icon'
  | 'link.icon.sys.type'
  | 'link.spaceId'
  | 'link.createdAt'
  | 'link.updatedAt'
  | 'link.sys.type'
  | 'link.sys.revision'
  | 'link.project'
  | 'link.project.contentful_id'
  | 'link.project.id'
  | 'link.project.node_locale'
  | 'link.project.title'
  | 'link.project.creationDate'
  | 'link.project.type'
  | 'link.project.description.raw'
  | 'link.project.link.contentful_id'
  | 'link.project.link.id'
  | 'link.project.link.node_locale'
  | 'link.project.link.title'
  | 'link.project.link.url'
  | 'link.project.link.section'
  | 'link.project.link.spaceId'
  | 'link.project.link.createdAt'
  | 'link.project.link.updatedAt'
  | 'link.project.link.project'
  | 'link.project.link.childrenContentfulLinkIconTextNode'
  | 'link.project.link.children'
  | 'link.project.thumbnail.contentful_id'
  | 'link.project.thumbnail.id'
  | 'link.project.thumbnail.spaceId'
  | 'link.project.thumbnail.createdAt'
  | 'link.project.thumbnail.updatedAt'
  | 'link.project.thumbnail.title'
  | 'link.project.thumbnail.description'
  | 'link.project.thumbnail.node_locale'
  | 'link.project.thumbnail.gatsbyImageData'
  | 'link.project.thumbnail.children'
  | 'link.project.section'
  | 'link.project.section.contentful_id'
  | 'link.project.section.id'
  | 'link.project.section.node_locale'
  | 'link.project.section.title'
  | 'link.project.section.spaceId'
  | 'link.project.section.createdAt'
  | 'link.project.section.updatedAt'
  | 'link.project.section.section'
  | 'link.project.section.page'
  | 'link.project.section.children'
  | 'link.project.spaceId'
  | 'link.project.createdAt'
  | 'link.project.updatedAt'
  | 'link.project.sys.type'
  | 'link.project.sys.revision'
  | 'link.project.parent.id'
  | 'link.project.parent.children'
  | 'link.project.children'
  | 'link.project.children.id'
  | 'link.project.children.children'
  | 'link.project.internal.content'
  | 'link.project.internal.contentDigest'
  | 'link.project.internal.description'
  | 'link.project.internal.fieldOwners'
  | 'link.project.internal.ignoreType'
  | 'link.project.internal.mediaType'
  | 'link.project.internal.owner'
  | 'link.project.internal.type'
  | 'link.childrenContentfulLinkIconTextNode'
  | 'link.childrenContentfulLinkIconTextNode.id'
  | 'link.childrenContentfulLinkIconTextNode.parent.id'
  | 'link.childrenContentfulLinkIconTextNode.parent.children'
  | 'link.childrenContentfulLinkIconTextNode.children'
  | 'link.childrenContentfulLinkIconTextNode.children.id'
  | 'link.childrenContentfulLinkIconTextNode.children.children'
  | 'link.childrenContentfulLinkIconTextNode.internal.content'
  | 'link.childrenContentfulLinkIconTextNode.internal.contentDigest'
  | 'link.childrenContentfulLinkIconTextNode.internal.description'
  | 'link.childrenContentfulLinkIconTextNode.internal.fieldOwners'
  | 'link.childrenContentfulLinkIconTextNode.internal.ignoreType'
  | 'link.childrenContentfulLinkIconTextNode.internal.mediaType'
  | 'link.childrenContentfulLinkIconTextNode.internal.owner'
  | 'link.childrenContentfulLinkIconTextNode.internal.type'
  | 'link.childrenContentfulLinkIconTextNode.icon'
  | 'link.childrenContentfulLinkIconTextNode.sys.type'
  | 'link.childContentfulLinkIconTextNode.id'
  | 'link.childContentfulLinkIconTextNode.parent.id'
  | 'link.childContentfulLinkIconTextNode.parent.children'
  | 'link.childContentfulLinkIconTextNode.children'
  | 'link.childContentfulLinkIconTextNode.children.id'
  | 'link.childContentfulLinkIconTextNode.children.children'
  | 'link.childContentfulLinkIconTextNode.internal.content'
  | 'link.childContentfulLinkIconTextNode.internal.contentDigest'
  | 'link.childContentfulLinkIconTextNode.internal.description'
  | 'link.childContentfulLinkIconTextNode.internal.fieldOwners'
  | 'link.childContentfulLinkIconTextNode.internal.ignoreType'
  | 'link.childContentfulLinkIconTextNode.internal.mediaType'
  | 'link.childContentfulLinkIconTextNode.internal.owner'
  | 'link.childContentfulLinkIconTextNode.internal.type'
  | 'link.childContentfulLinkIconTextNode.icon'
  | 'link.childContentfulLinkIconTextNode.sys.type'
  | 'link.parent.id'
  | 'link.parent.parent.id'
  | 'link.parent.parent.children'
  | 'link.parent.children'
  | 'link.parent.children.id'
  | 'link.parent.children.children'
  | 'link.parent.internal.content'
  | 'link.parent.internal.contentDigest'
  | 'link.parent.internal.description'
  | 'link.parent.internal.fieldOwners'
  | 'link.parent.internal.ignoreType'
  | 'link.parent.internal.mediaType'
  | 'link.parent.internal.owner'
  | 'link.parent.internal.type'
  | 'link.children'
  | 'link.children.id'
  | 'link.children.parent.id'
  | 'link.children.parent.children'
  | 'link.children.children'
  | 'link.children.children.id'
  | 'link.children.children.children'
  | 'link.children.internal.content'
  | 'link.children.internal.contentDigest'
  | 'link.children.internal.description'
  | 'link.children.internal.fieldOwners'
  | 'link.children.internal.ignoreType'
  | 'link.children.internal.mediaType'
  | 'link.children.internal.owner'
  | 'link.children.internal.type'
  | 'link.internal.content'
  | 'link.internal.contentDigest'
  | 'link.internal.description'
  | 'link.internal.fieldOwners'
  | 'link.internal.ignoreType'
  | 'link.internal.mediaType'
  | 'link.internal.owner'
  | 'link.internal.type'
  | 'thumbnail.contentful_id'
  | 'thumbnail.id'
  | 'thumbnail.spaceId'
  | 'thumbnail.createdAt'
  | 'thumbnail.updatedAt'
  | 'thumbnail.file.url'
  | 'thumbnail.file.details.size'
  | 'thumbnail.file.fileName'
  | 'thumbnail.file.contentType'
  | 'thumbnail.title'
  | 'thumbnail.description'
  | 'thumbnail.node_locale'
  | 'thumbnail.sys.type'
  | 'thumbnail.sys.revision'
  | 'thumbnail.fixed.base64'
  | 'thumbnail.fixed.tracedSVG'
  | 'thumbnail.fixed.aspectRatio'
  | 'thumbnail.fixed.width'
  | 'thumbnail.fixed.height'
  | 'thumbnail.fixed.src'
  | 'thumbnail.fixed.srcSet'
  | 'thumbnail.fixed.srcWebp'
  | 'thumbnail.fixed.srcSetWebp'
  | 'thumbnail.fluid.base64'
  | 'thumbnail.fluid.tracedSVG'
  | 'thumbnail.fluid.aspectRatio'
  | 'thumbnail.fluid.src'
  | 'thumbnail.fluid.srcSet'
  | 'thumbnail.fluid.srcWebp'
  | 'thumbnail.fluid.srcSetWebp'
  | 'thumbnail.fluid.sizes'
  | 'thumbnail.gatsbyImageData'
  | 'thumbnail.resize.base64'
  | 'thumbnail.resize.tracedSVG'
  | 'thumbnail.resize.src'
  | 'thumbnail.resize.width'
  | 'thumbnail.resize.height'
  | 'thumbnail.resize.aspectRatio'
  | 'thumbnail.parent.id'
  | 'thumbnail.parent.parent.id'
  | 'thumbnail.parent.parent.children'
  | 'thumbnail.parent.children'
  | 'thumbnail.parent.children.id'
  | 'thumbnail.parent.children.children'
  | 'thumbnail.parent.internal.content'
  | 'thumbnail.parent.internal.contentDigest'
  | 'thumbnail.parent.internal.description'
  | 'thumbnail.parent.internal.fieldOwners'
  | 'thumbnail.parent.internal.ignoreType'
  | 'thumbnail.parent.internal.mediaType'
  | 'thumbnail.parent.internal.owner'
  | 'thumbnail.parent.internal.type'
  | 'thumbnail.children'
  | 'thumbnail.children.id'
  | 'thumbnail.children.parent.id'
  | 'thumbnail.children.parent.children'
  | 'thumbnail.children.children'
  | 'thumbnail.children.children.id'
  | 'thumbnail.children.children.children'
  | 'thumbnail.children.internal.content'
  | 'thumbnail.children.internal.contentDigest'
  | 'thumbnail.children.internal.description'
  | 'thumbnail.children.internal.fieldOwners'
  | 'thumbnail.children.internal.ignoreType'
  | 'thumbnail.children.internal.mediaType'
  | 'thumbnail.children.internal.owner'
  | 'thumbnail.children.internal.type'
  | 'thumbnail.internal.content'
  | 'thumbnail.internal.contentDigest'
  | 'thumbnail.internal.description'
  | 'thumbnail.internal.fieldOwners'
  | 'thumbnail.internal.ignoreType'
  | 'thumbnail.internal.mediaType'
  | 'thumbnail.internal.owner'
  | 'thumbnail.internal.type'
  | 'section'
  | 'section.contentful_id'
  | 'section.id'
  | 'section.node_locale'
  | 'section.title'
  | 'section.spaceId'
  | 'section.createdAt'
  | 'section.updatedAt'
  | 'section.sys.type'
  | 'section.sys.revision'
  | 'section.section'
  | 'section.section.contentful_id'
  | 'section.section.id'
  | 'section.section.node_locale'
  | 'section.section.title'
  | 'section.section.spaceId'
  | 'section.section.createdAt'
  | 'section.section.updatedAt'
  | 'section.section.sys.type'
  | 'section.section.sys.revision'
  | 'section.section.section'
  | 'section.section.section.contentful_id'
  | 'section.section.section.id'
  | 'section.section.section.node_locale'
  | 'section.section.section.title'
  | 'section.section.section.spaceId'
  | 'section.section.section.createdAt'
  | 'section.section.section.updatedAt'
  | 'section.section.section.section'
  | 'section.section.section.page'
  | 'section.section.section.children'
  | 'section.section.page'
  | 'section.section.page.contentful_id'
  | 'section.section.page.id'
  | 'section.section.page.node_locale'
  | 'section.section.page.title'
  | 'section.section.page.slug'
  | 'section.section.page.spaceId'
  | 'section.section.page.createdAt'
  | 'section.section.page.updatedAt'
  | 'section.section.page.children'
  | 'section.section.parent.id'
  | 'section.section.parent.children'
  | 'section.section.children'
  | 'section.section.children.id'
  | 'section.section.children.children'
  | 'section.section.internal.content'
  | 'section.section.internal.contentDigest'
  | 'section.section.internal.description'
  | 'section.section.internal.fieldOwners'
  | 'section.section.internal.ignoreType'
  | 'section.section.internal.mediaType'
  | 'section.section.internal.owner'
  | 'section.section.internal.type'
  | 'section.page'
  | 'section.page.contentful_id'
  | 'section.page.id'
  | 'section.page.node_locale'
  | 'section.page.title'
  | 'section.page.slug'
  | 'section.page.spaceId'
  | 'section.page.createdAt'
  | 'section.page.updatedAt'
  | 'section.page.sys.type'
  | 'section.page.sys.revision'
  | 'section.page.parent.id'
  | 'section.page.parent.children'
  | 'section.page.children'
  | 'section.page.children.id'
  | 'section.page.children.children'
  | 'section.page.internal.content'
  | 'section.page.internal.contentDigest'
  | 'section.page.internal.description'
  | 'section.page.internal.fieldOwners'
  | 'section.page.internal.ignoreType'
  | 'section.page.internal.mediaType'
  | 'section.page.internal.owner'
  | 'section.page.internal.type'
  | 'section.parent.id'
  | 'section.parent.parent.id'
  | 'section.parent.parent.children'
  | 'section.parent.children'
  | 'section.parent.children.id'
  | 'section.parent.children.children'
  | 'section.parent.internal.content'
  | 'section.parent.internal.contentDigest'
  | 'section.parent.internal.description'
  | 'section.parent.internal.fieldOwners'
  | 'section.parent.internal.ignoreType'
  | 'section.parent.internal.mediaType'
  | 'section.parent.internal.owner'
  | 'section.parent.internal.type'
  | 'section.children'
  | 'section.children.id'
  | 'section.children.parent.id'
  | 'section.children.parent.children'
  | 'section.children.children'
  | 'section.children.children.id'
  | 'section.children.children.children'
  | 'section.children.internal.content'
  | 'section.children.internal.contentDigest'
  | 'section.children.internal.description'
  | 'section.children.internal.fieldOwners'
  | 'section.children.internal.ignoreType'
  | 'section.children.internal.mediaType'
  | 'section.children.internal.owner'
  | 'section.children.internal.type'
  | 'section.internal.content'
  | 'section.internal.contentDigest'
  | 'section.internal.description'
  | 'section.internal.fieldOwners'
  | 'section.internal.ignoreType'
  | 'section.internal.mediaType'
  | 'section.internal.owner'
  | 'section.internal.type'
  | 'spaceId'
  | 'createdAt'
  | 'updatedAt'
  | 'sys.type'
  | 'sys.revision'
  | 'sys.contentType.sys.type'
  | 'sys.contentType.sys.linkType'
  | 'sys.contentType.sys.id'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type';

type ContentfulProjectGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulProjectEdge>;
  readonly nodes: ReadonlyArray<ContentfulProject>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type ContentfulProjectSortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<ContentfulProjectFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type ContentfulBookConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulBookEdge>;
  readonly nodes: ReadonlyArray<ContentfulBook>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<ContentfulBookGroupConnection>;
};


type ContentfulBookConnection_distinctArgs = {
  field: ContentfulBookFieldsEnum;
};


type ContentfulBookConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: ContentfulBookFieldsEnum;
};

type ContentfulBookEdge = {
  readonly next: Maybe<ContentfulBook>;
  readonly node: ContentfulBook;
  readonly previous: Maybe<ContentfulBook>;
};

type ContentfulBookFieldsEnum =
  | 'contentful_id'
  | 'id'
  | 'node_locale'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type';

type ContentfulBookGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulBookEdge>;
  readonly nodes: ReadonlyArray<ContentfulBook>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type ContentfulBookFilterInput = {
  readonly contentful_id: Maybe<StringQueryOperatorInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly node_locale: Maybe<StringQueryOperatorInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
};

type ContentfulBookSortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<ContentfulBookFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type ContentfulLinkConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulLinkEdge>;
  readonly nodes: ReadonlyArray<ContentfulLink>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<ContentfulLinkGroupConnection>;
};


type ContentfulLinkConnection_distinctArgs = {
  field: ContentfulLinkFieldsEnum;
};


type ContentfulLinkConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: ContentfulLinkFieldsEnum;
};

type ContentfulLinkEdge = {
  readonly next: Maybe<ContentfulLink>;
  readonly node: ContentfulLink;
  readonly previous: Maybe<ContentfulLink>;
};

type ContentfulLinkFieldsEnum =
  | 'contentful_id'
  | 'id'
  | 'node_locale'
  | 'title'
  | 'url'
  | 'section'
  | 'section.contentful_id'
  | 'section.id'
  | 'section.node_locale'
  | 'section.title'
  | 'section.spaceId'
  | 'section.createdAt'
  | 'section.updatedAt'
  | 'section.sys.type'
  | 'section.sys.revision'
  | 'section.section'
  | 'section.section.contentful_id'
  | 'section.section.id'
  | 'section.section.node_locale'
  | 'section.section.title'
  | 'section.section.spaceId'
  | 'section.section.createdAt'
  | 'section.section.updatedAt'
  | 'section.section.sys.type'
  | 'section.section.sys.revision'
  | 'section.section.section'
  | 'section.section.section.contentful_id'
  | 'section.section.section.id'
  | 'section.section.section.node_locale'
  | 'section.section.section.title'
  | 'section.section.section.spaceId'
  | 'section.section.section.createdAt'
  | 'section.section.section.updatedAt'
  | 'section.section.section.section'
  | 'section.section.section.page'
  | 'section.section.section.children'
  | 'section.section.page'
  | 'section.section.page.contentful_id'
  | 'section.section.page.id'
  | 'section.section.page.node_locale'
  | 'section.section.page.title'
  | 'section.section.page.slug'
  | 'section.section.page.spaceId'
  | 'section.section.page.createdAt'
  | 'section.section.page.updatedAt'
  | 'section.section.page.children'
  | 'section.section.parent.id'
  | 'section.section.parent.children'
  | 'section.section.children'
  | 'section.section.children.id'
  | 'section.section.children.children'
  | 'section.section.internal.content'
  | 'section.section.internal.contentDigest'
  | 'section.section.internal.description'
  | 'section.section.internal.fieldOwners'
  | 'section.section.internal.ignoreType'
  | 'section.section.internal.mediaType'
  | 'section.section.internal.owner'
  | 'section.section.internal.type'
  | 'section.page'
  | 'section.page.contentful_id'
  | 'section.page.id'
  | 'section.page.node_locale'
  | 'section.page.title'
  | 'section.page.slug'
  | 'section.page.spaceId'
  | 'section.page.createdAt'
  | 'section.page.updatedAt'
  | 'section.page.sys.type'
  | 'section.page.sys.revision'
  | 'section.page.parent.id'
  | 'section.page.parent.children'
  | 'section.page.children'
  | 'section.page.children.id'
  | 'section.page.children.children'
  | 'section.page.internal.content'
  | 'section.page.internal.contentDigest'
  | 'section.page.internal.description'
  | 'section.page.internal.fieldOwners'
  | 'section.page.internal.ignoreType'
  | 'section.page.internal.mediaType'
  | 'section.page.internal.owner'
  | 'section.page.internal.type'
  | 'section.parent.id'
  | 'section.parent.parent.id'
  | 'section.parent.parent.children'
  | 'section.parent.children'
  | 'section.parent.children.id'
  | 'section.parent.children.children'
  | 'section.parent.internal.content'
  | 'section.parent.internal.contentDigest'
  | 'section.parent.internal.description'
  | 'section.parent.internal.fieldOwners'
  | 'section.parent.internal.ignoreType'
  | 'section.parent.internal.mediaType'
  | 'section.parent.internal.owner'
  | 'section.parent.internal.type'
  | 'section.children'
  | 'section.children.id'
  | 'section.children.parent.id'
  | 'section.children.parent.children'
  | 'section.children.children'
  | 'section.children.children.id'
  | 'section.children.children.children'
  | 'section.children.internal.content'
  | 'section.children.internal.contentDigest'
  | 'section.children.internal.description'
  | 'section.children.internal.fieldOwners'
  | 'section.children.internal.ignoreType'
  | 'section.children.internal.mediaType'
  | 'section.children.internal.owner'
  | 'section.children.internal.type'
  | 'section.internal.content'
  | 'section.internal.contentDigest'
  | 'section.internal.description'
  | 'section.internal.fieldOwners'
  | 'section.internal.ignoreType'
  | 'section.internal.mediaType'
  | 'section.internal.owner'
  | 'section.internal.type'
  | 'icon.id'
  | 'icon.parent.id'
  | 'icon.parent.parent.id'
  | 'icon.parent.parent.children'
  | 'icon.parent.children'
  | 'icon.parent.children.id'
  | 'icon.parent.children.children'
  | 'icon.parent.internal.content'
  | 'icon.parent.internal.contentDigest'
  | 'icon.parent.internal.description'
  | 'icon.parent.internal.fieldOwners'
  | 'icon.parent.internal.ignoreType'
  | 'icon.parent.internal.mediaType'
  | 'icon.parent.internal.owner'
  | 'icon.parent.internal.type'
  | 'icon.children'
  | 'icon.children.id'
  | 'icon.children.parent.id'
  | 'icon.children.parent.children'
  | 'icon.children.children'
  | 'icon.children.children.id'
  | 'icon.children.children.children'
  | 'icon.children.internal.content'
  | 'icon.children.internal.contentDigest'
  | 'icon.children.internal.description'
  | 'icon.children.internal.fieldOwners'
  | 'icon.children.internal.ignoreType'
  | 'icon.children.internal.mediaType'
  | 'icon.children.internal.owner'
  | 'icon.children.internal.type'
  | 'icon.internal.content'
  | 'icon.internal.contentDigest'
  | 'icon.internal.description'
  | 'icon.internal.fieldOwners'
  | 'icon.internal.ignoreType'
  | 'icon.internal.mediaType'
  | 'icon.internal.owner'
  | 'icon.internal.type'
  | 'icon.icon'
  | 'icon.sys.type'
  | 'spaceId'
  | 'createdAt'
  | 'updatedAt'
  | 'sys.type'
  | 'sys.revision'
  | 'sys.contentType.sys.type'
  | 'sys.contentType.sys.linkType'
  | 'sys.contentType.sys.id'
  | 'project'
  | 'project.contentful_id'
  | 'project.id'
  | 'project.node_locale'
  | 'project.title'
  | 'project.creationDate'
  | 'project.type'
  | 'project.description.raw'
  | 'project.link.contentful_id'
  | 'project.link.id'
  | 'project.link.node_locale'
  | 'project.link.title'
  | 'project.link.url'
  | 'project.link.section'
  | 'project.link.section.contentful_id'
  | 'project.link.section.id'
  | 'project.link.section.node_locale'
  | 'project.link.section.title'
  | 'project.link.section.spaceId'
  | 'project.link.section.createdAt'
  | 'project.link.section.updatedAt'
  | 'project.link.section.section'
  | 'project.link.section.page'
  | 'project.link.section.children'
  | 'project.link.icon.id'
  | 'project.link.icon.children'
  | 'project.link.icon.icon'
  | 'project.link.spaceId'
  | 'project.link.createdAt'
  | 'project.link.updatedAt'
  | 'project.link.sys.type'
  | 'project.link.sys.revision'
  | 'project.link.project'
  | 'project.link.project.contentful_id'
  | 'project.link.project.id'
  | 'project.link.project.node_locale'
  | 'project.link.project.title'
  | 'project.link.project.creationDate'
  | 'project.link.project.type'
  | 'project.link.project.section'
  | 'project.link.project.spaceId'
  | 'project.link.project.createdAt'
  | 'project.link.project.updatedAt'
  | 'project.link.project.children'
  | 'project.link.childrenContentfulLinkIconTextNode'
  | 'project.link.childrenContentfulLinkIconTextNode.id'
  | 'project.link.childrenContentfulLinkIconTextNode.children'
  | 'project.link.childrenContentfulLinkIconTextNode.icon'
  | 'project.link.childContentfulLinkIconTextNode.id'
  | 'project.link.childContentfulLinkIconTextNode.children'
  | 'project.link.childContentfulLinkIconTextNode.icon'
  | 'project.link.parent.id'
  | 'project.link.parent.children'
  | 'project.link.children'
  | 'project.link.children.id'
  | 'project.link.children.children'
  | 'project.link.internal.content'
  | 'project.link.internal.contentDigest'
  | 'project.link.internal.description'
  | 'project.link.internal.fieldOwners'
  | 'project.link.internal.ignoreType'
  | 'project.link.internal.mediaType'
  | 'project.link.internal.owner'
  | 'project.link.internal.type'
  | 'project.thumbnail.contentful_id'
  | 'project.thumbnail.id'
  | 'project.thumbnail.spaceId'
  | 'project.thumbnail.createdAt'
  | 'project.thumbnail.updatedAt'
  | 'project.thumbnail.file.url'
  | 'project.thumbnail.file.fileName'
  | 'project.thumbnail.file.contentType'
  | 'project.thumbnail.title'
  | 'project.thumbnail.description'
  | 'project.thumbnail.node_locale'
  | 'project.thumbnail.sys.type'
  | 'project.thumbnail.sys.revision'
  | 'project.thumbnail.fixed.base64'
  | 'project.thumbnail.fixed.tracedSVG'
  | 'project.thumbnail.fixed.aspectRatio'
  | 'project.thumbnail.fixed.width'
  | 'project.thumbnail.fixed.height'
  | 'project.thumbnail.fixed.src'
  | 'project.thumbnail.fixed.srcSet'
  | 'project.thumbnail.fixed.srcWebp'
  | 'project.thumbnail.fixed.srcSetWebp'
  | 'project.thumbnail.fluid.base64'
  | 'project.thumbnail.fluid.tracedSVG'
  | 'project.thumbnail.fluid.aspectRatio'
  | 'project.thumbnail.fluid.src'
  | 'project.thumbnail.fluid.srcSet'
  | 'project.thumbnail.fluid.srcWebp'
  | 'project.thumbnail.fluid.srcSetWebp'
  | 'project.thumbnail.fluid.sizes'
  | 'project.thumbnail.gatsbyImageData'
  | 'project.thumbnail.resize.base64'
  | 'project.thumbnail.resize.tracedSVG'
  | 'project.thumbnail.resize.src'
  | 'project.thumbnail.resize.width'
  | 'project.thumbnail.resize.height'
  | 'project.thumbnail.resize.aspectRatio'
  | 'project.thumbnail.parent.id'
  | 'project.thumbnail.parent.children'
  | 'project.thumbnail.children'
  | 'project.thumbnail.children.id'
  | 'project.thumbnail.children.children'
  | 'project.thumbnail.internal.content'
  | 'project.thumbnail.internal.contentDigest'
  | 'project.thumbnail.internal.description'
  | 'project.thumbnail.internal.fieldOwners'
  | 'project.thumbnail.internal.ignoreType'
  | 'project.thumbnail.internal.mediaType'
  | 'project.thumbnail.internal.owner'
  | 'project.thumbnail.internal.type'
  | 'project.section'
  | 'project.section.contentful_id'
  | 'project.section.id'
  | 'project.section.node_locale'
  | 'project.section.title'
  | 'project.section.spaceId'
  | 'project.section.createdAt'
  | 'project.section.updatedAt'
  | 'project.section.sys.type'
  | 'project.section.sys.revision'
  | 'project.section.section'
  | 'project.section.section.contentful_id'
  | 'project.section.section.id'
  | 'project.section.section.node_locale'
  | 'project.section.section.title'
  | 'project.section.section.spaceId'
  | 'project.section.section.createdAt'
  | 'project.section.section.updatedAt'
  | 'project.section.section.section'
  | 'project.section.section.page'
  | 'project.section.section.children'
  | 'project.section.page'
  | 'project.section.page.contentful_id'
  | 'project.section.page.id'
  | 'project.section.page.node_locale'
  | 'project.section.page.title'
  | 'project.section.page.slug'
  | 'project.section.page.spaceId'
  | 'project.section.page.createdAt'
  | 'project.section.page.updatedAt'
  | 'project.section.page.children'
  | 'project.section.parent.id'
  | 'project.section.parent.children'
  | 'project.section.children'
  | 'project.section.children.id'
  | 'project.section.children.children'
  | 'project.section.internal.content'
  | 'project.section.internal.contentDigest'
  | 'project.section.internal.description'
  | 'project.section.internal.fieldOwners'
  | 'project.section.internal.ignoreType'
  | 'project.section.internal.mediaType'
  | 'project.section.internal.owner'
  | 'project.section.internal.type'
  | 'project.spaceId'
  | 'project.createdAt'
  | 'project.updatedAt'
  | 'project.sys.type'
  | 'project.sys.revision'
  | 'project.parent.id'
  | 'project.parent.parent.id'
  | 'project.parent.parent.children'
  | 'project.parent.children'
  | 'project.parent.children.id'
  | 'project.parent.children.children'
  | 'project.parent.internal.content'
  | 'project.parent.internal.contentDigest'
  | 'project.parent.internal.description'
  | 'project.parent.internal.fieldOwners'
  | 'project.parent.internal.ignoreType'
  | 'project.parent.internal.mediaType'
  | 'project.parent.internal.owner'
  | 'project.parent.internal.type'
  | 'project.children'
  | 'project.children.id'
  | 'project.children.parent.id'
  | 'project.children.parent.children'
  | 'project.children.children'
  | 'project.children.children.id'
  | 'project.children.children.children'
  | 'project.children.internal.content'
  | 'project.children.internal.contentDigest'
  | 'project.children.internal.description'
  | 'project.children.internal.fieldOwners'
  | 'project.children.internal.ignoreType'
  | 'project.children.internal.mediaType'
  | 'project.children.internal.owner'
  | 'project.children.internal.type'
  | 'project.internal.content'
  | 'project.internal.contentDigest'
  | 'project.internal.description'
  | 'project.internal.fieldOwners'
  | 'project.internal.ignoreType'
  | 'project.internal.mediaType'
  | 'project.internal.owner'
  | 'project.internal.type'
  | 'childrenContentfulLinkIconTextNode'
  | 'childrenContentfulLinkIconTextNode.id'
  | 'childrenContentfulLinkIconTextNode.parent.id'
  | 'childrenContentfulLinkIconTextNode.parent.parent.id'
  | 'childrenContentfulLinkIconTextNode.parent.parent.children'
  | 'childrenContentfulLinkIconTextNode.parent.children'
  | 'childrenContentfulLinkIconTextNode.parent.children.id'
  | 'childrenContentfulLinkIconTextNode.parent.children.children'
  | 'childrenContentfulLinkIconTextNode.parent.internal.content'
  | 'childrenContentfulLinkIconTextNode.parent.internal.contentDigest'
  | 'childrenContentfulLinkIconTextNode.parent.internal.description'
  | 'childrenContentfulLinkIconTextNode.parent.internal.fieldOwners'
  | 'childrenContentfulLinkIconTextNode.parent.internal.ignoreType'
  | 'childrenContentfulLinkIconTextNode.parent.internal.mediaType'
  | 'childrenContentfulLinkIconTextNode.parent.internal.owner'
  | 'childrenContentfulLinkIconTextNode.parent.internal.type'
  | 'childrenContentfulLinkIconTextNode.children'
  | 'childrenContentfulLinkIconTextNode.children.id'
  | 'childrenContentfulLinkIconTextNode.children.parent.id'
  | 'childrenContentfulLinkIconTextNode.children.parent.children'
  | 'childrenContentfulLinkIconTextNode.children.children'
  | 'childrenContentfulLinkIconTextNode.children.children.id'
  | 'childrenContentfulLinkIconTextNode.children.children.children'
  | 'childrenContentfulLinkIconTextNode.children.internal.content'
  | 'childrenContentfulLinkIconTextNode.children.internal.contentDigest'
  | 'childrenContentfulLinkIconTextNode.children.internal.description'
  | 'childrenContentfulLinkIconTextNode.children.internal.fieldOwners'
  | 'childrenContentfulLinkIconTextNode.children.internal.ignoreType'
  | 'childrenContentfulLinkIconTextNode.children.internal.mediaType'
  | 'childrenContentfulLinkIconTextNode.children.internal.owner'
  | 'childrenContentfulLinkIconTextNode.children.internal.type'
  | 'childrenContentfulLinkIconTextNode.internal.content'
  | 'childrenContentfulLinkIconTextNode.internal.contentDigest'
  | 'childrenContentfulLinkIconTextNode.internal.description'
  | 'childrenContentfulLinkIconTextNode.internal.fieldOwners'
  | 'childrenContentfulLinkIconTextNode.internal.ignoreType'
  | 'childrenContentfulLinkIconTextNode.internal.mediaType'
  | 'childrenContentfulLinkIconTextNode.internal.owner'
  | 'childrenContentfulLinkIconTextNode.internal.type'
  | 'childrenContentfulLinkIconTextNode.icon'
  | 'childrenContentfulLinkIconTextNode.sys.type'
  | 'childContentfulLinkIconTextNode.id'
  | 'childContentfulLinkIconTextNode.parent.id'
  | 'childContentfulLinkIconTextNode.parent.parent.id'
  | 'childContentfulLinkIconTextNode.parent.parent.children'
  | 'childContentfulLinkIconTextNode.parent.children'
  | 'childContentfulLinkIconTextNode.parent.children.id'
  | 'childContentfulLinkIconTextNode.parent.children.children'
  | 'childContentfulLinkIconTextNode.parent.internal.content'
  | 'childContentfulLinkIconTextNode.parent.internal.contentDigest'
  | 'childContentfulLinkIconTextNode.parent.internal.description'
  | 'childContentfulLinkIconTextNode.parent.internal.fieldOwners'
  | 'childContentfulLinkIconTextNode.parent.internal.ignoreType'
  | 'childContentfulLinkIconTextNode.parent.internal.mediaType'
  | 'childContentfulLinkIconTextNode.parent.internal.owner'
  | 'childContentfulLinkIconTextNode.parent.internal.type'
  | 'childContentfulLinkIconTextNode.children'
  | 'childContentfulLinkIconTextNode.children.id'
  | 'childContentfulLinkIconTextNode.children.parent.id'
  | 'childContentfulLinkIconTextNode.children.parent.children'
  | 'childContentfulLinkIconTextNode.children.children'
  | 'childContentfulLinkIconTextNode.children.children.id'
  | 'childContentfulLinkIconTextNode.children.children.children'
  | 'childContentfulLinkIconTextNode.children.internal.content'
  | 'childContentfulLinkIconTextNode.children.internal.contentDigest'
  | 'childContentfulLinkIconTextNode.children.internal.description'
  | 'childContentfulLinkIconTextNode.children.internal.fieldOwners'
  | 'childContentfulLinkIconTextNode.children.internal.ignoreType'
  | 'childContentfulLinkIconTextNode.children.internal.mediaType'
  | 'childContentfulLinkIconTextNode.children.internal.owner'
  | 'childContentfulLinkIconTextNode.children.internal.type'
  | 'childContentfulLinkIconTextNode.internal.content'
  | 'childContentfulLinkIconTextNode.internal.contentDigest'
  | 'childContentfulLinkIconTextNode.internal.description'
  | 'childContentfulLinkIconTextNode.internal.fieldOwners'
  | 'childContentfulLinkIconTextNode.internal.ignoreType'
  | 'childContentfulLinkIconTextNode.internal.mediaType'
  | 'childContentfulLinkIconTextNode.internal.owner'
  | 'childContentfulLinkIconTextNode.internal.type'
  | 'childContentfulLinkIconTextNode.icon'
  | 'childContentfulLinkIconTextNode.sys.type'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type';

type ContentfulLinkGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulLinkEdge>;
  readonly nodes: ReadonlyArray<ContentfulLink>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type ContentfulLinkSortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<ContentfulLinkFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type ContentfulPageConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulPageEdge>;
  readonly nodes: ReadonlyArray<ContentfulPage>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<ContentfulPageGroupConnection>;
};


type ContentfulPageConnection_distinctArgs = {
  field: ContentfulPageFieldsEnum;
};


type ContentfulPageConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: ContentfulPageFieldsEnum;
};

type ContentfulPageEdge = {
  readonly next: Maybe<ContentfulPage>;
  readonly node: ContentfulPage;
  readonly previous: Maybe<ContentfulPage>;
};

type ContentfulPageFieldsEnum =
  | 'contentful_id'
  | 'id'
  | 'node_locale'
  | 'title'
  | 'slug'
  | 'spaceId'
  | 'createdAt'
  | 'updatedAt'
  | 'sys.type'
  | 'sys.contentType.sys.type'
  | 'sys.contentType.sys.linkType'
  | 'sys.contentType.sys.id'
  | 'sys.revision'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type';

type ContentfulPageGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulPageEdge>;
  readonly nodes: ReadonlyArray<ContentfulPage>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type ContentfulPageSortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<ContentfulPageFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type ContentfulSectionConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulSectionEdge>;
  readonly nodes: ReadonlyArray<ContentfulSection>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<ContentfulSectionGroupConnection>;
};


type ContentfulSectionConnection_distinctArgs = {
  field: ContentfulSectionFieldsEnum;
};


type ContentfulSectionConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: ContentfulSectionFieldsEnum;
};

type ContentfulSectionEdge = {
  readonly next: Maybe<ContentfulSection>;
  readonly node: ContentfulSection;
  readonly previous: Maybe<ContentfulSection>;
};

type ContentfulSectionFieldsEnum =
  | 'contentful_id'
  | 'id'
  | 'node_locale'
  | 'title'
  | 'spaceId'
  | 'createdAt'
  | 'updatedAt'
  | 'sys.type'
  | 'sys.revision'
  | 'sys.contentType.sys.type'
  | 'sys.contentType.sys.linkType'
  | 'sys.contentType.sys.id'
  | 'section'
  | 'section.contentful_id'
  | 'section.id'
  | 'section.node_locale'
  | 'section.title'
  | 'section.spaceId'
  | 'section.createdAt'
  | 'section.updatedAt'
  | 'section.sys.type'
  | 'section.sys.revision'
  | 'section.section'
  | 'section.section.contentful_id'
  | 'section.section.id'
  | 'section.section.node_locale'
  | 'section.section.title'
  | 'section.section.spaceId'
  | 'section.section.createdAt'
  | 'section.section.updatedAt'
  | 'section.section.sys.type'
  | 'section.section.sys.revision'
  | 'section.section.section'
  | 'section.section.section.contentful_id'
  | 'section.section.section.id'
  | 'section.section.section.node_locale'
  | 'section.section.section.title'
  | 'section.section.section.spaceId'
  | 'section.section.section.createdAt'
  | 'section.section.section.updatedAt'
  | 'section.section.section.section'
  | 'section.section.section.page'
  | 'section.section.section.children'
  | 'section.section.page'
  | 'section.section.page.contentful_id'
  | 'section.section.page.id'
  | 'section.section.page.node_locale'
  | 'section.section.page.title'
  | 'section.section.page.slug'
  | 'section.section.page.spaceId'
  | 'section.section.page.createdAt'
  | 'section.section.page.updatedAt'
  | 'section.section.page.children'
  | 'section.section.parent.id'
  | 'section.section.parent.children'
  | 'section.section.children'
  | 'section.section.children.id'
  | 'section.section.children.children'
  | 'section.section.internal.content'
  | 'section.section.internal.contentDigest'
  | 'section.section.internal.description'
  | 'section.section.internal.fieldOwners'
  | 'section.section.internal.ignoreType'
  | 'section.section.internal.mediaType'
  | 'section.section.internal.owner'
  | 'section.section.internal.type'
  | 'section.page'
  | 'section.page.contentful_id'
  | 'section.page.id'
  | 'section.page.node_locale'
  | 'section.page.title'
  | 'section.page.slug'
  | 'section.page.spaceId'
  | 'section.page.createdAt'
  | 'section.page.updatedAt'
  | 'section.page.sys.type'
  | 'section.page.sys.revision'
  | 'section.page.parent.id'
  | 'section.page.parent.children'
  | 'section.page.children'
  | 'section.page.children.id'
  | 'section.page.children.children'
  | 'section.page.internal.content'
  | 'section.page.internal.contentDigest'
  | 'section.page.internal.description'
  | 'section.page.internal.fieldOwners'
  | 'section.page.internal.ignoreType'
  | 'section.page.internal.mediaType'
  | 'section.page.internal.owner'
  | 'section.page.internal.type'
  | 'section.parent.id'
  | 'section.parent.parent.id'
  | 'section.parent.parent.children'
  | 'section.parent.children'
  | 'section.parent.children.id'
  | 'section.parent.children.children'
  | 'section.parent.internal.content'
  | 'section.parent.internal.contentDigest'
  | 'section.parent.internal.description'
  | 'section.parent.internal.fieldOwners'
  | 'section.parent.internal.ignoreType'
  | 'section.parent.internal.mediaType'
  | 'section.parent.internal.owner'
  | 'section.parent.internal.type'
  | 'section.children'
  | 'section.children.id'
  | 'section.children.parent.id'
  | 'section.children.parent.children'
  | 'section.children.children'
  | 'section.children.children.id'
  | 'section.children.children.children'
  | 'section.children.internal.content'
  | 'section.children.internal.contentDigest'
  | 'section.children.internal.description'
  | 'section.children.internal.fieldOwners'
  | 'section.children.internal.ignoreType'
  | 'section.children.internal.mediaType'
  | 'section.children.internal.owner'
  | 'section.children.internal.type'
  | 'section.internal.content'
  | 'section.internal.contentDigest'
  | 'section.internal.description'
  | 'section.internal.fieldOwners'
  | 'section.internal.ignoreType'
  | 'section.internal.mediaType'
  | 'section.internal.owner'
  | 'section.internal.type'
  | 'page'
  | 'page.contentful_id'
  | 'page.id'
  | 'page.node_locale'
  | 'page.title'
  | 'page.slug'
  | 'page.spaceId'
  | 'page.createdAt'
  | 'page.updatedAt'
  | 'page.sys.type'
  | 'page.sys.revision'
  | 'page.parent.id'
  | 'page.parent.parent.id'
  | 'page.parent.parent.children'
  | 'page.parent.children'
  | 'page.parent.children.id'
  | 'page.parent.children.children'
  | 'page.parent.internal.content'
  | 'page.parent.internal.contentDigest'
  | 'page.parent.internal.description'
  | 'page.parent.internal.fieldOwners'
  | 'page.parent.internal.ignoreType'
  | 'page.parent.internal.mediaType'
  | 'page.parent.internal.owner'
  | 'page.parent.internal.type'
  | 'page.children'
  | 'page.children.id'
  | 'page.children.parent.id'
  | 'page.children.parent.children'
  | 'page.children.children'
  | 'page.children.children.id'
  | 'page.children.children.children'
  | 'page.children.internal.content'
  | 'page.children.internal.contentDigest'
  | 'page.children.internal.description'
  | 'page.children.internal.fieldOwners'
  | 'page.children.internal.ignoreType'
  | 'page.children.internal.mediaType'
  | 'page.children.internal.owner'
  | 'page.children.internal.type'
  | 'page.internal.content'
  | 'page.internal.contentDigest'
  | 'page.internal.description'
  | 'page.internal.fieldOwners'
  | 'page.internal.ignoreType'
  | 'page.internal.mediaType'
  | 'page.internal.owner'
  | 'page.internal.type'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type';

type ContentfulSectionGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulSectionEdge>;
  readonly nodes: ReadonlyArray<ContentfulSection>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type ContentfulSectionSortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<ContentfulSectionFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type ContentfulTextTextFilterInput = {
  readonly raw: Maybe<StringQueryOperatorInput>;
};

type ContentfulTextSysFilterInput = {
  readonly type: Maybe<StringQueryOperatorInput>;
  readonly revision: Maybe<IntQueryOperatorInput>;
  readonly contentType: Maybe<ContentfulTextSysContentTypeFilterInput>;
};

type ContentfulTextSysContentTypeFilterInput = {
  readonly sys: Maybe<ContentfulTextSysContentTypeSysFilterInput>;
};

type ContentfulTextSysContentTypeSysFilterInput = {
  readonly type: Maybe<StringQueryOperatorInput>;
  readonly linkType: Maybe<StringQueryOperatorInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
};

type ContentfulTextConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulTextEdge>;
  readonly nodes: ReadonlyArray<ContentfulText>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<ContentfulTextGroupConnection>;
};


type ContentfulTextConnection_distinctArgs = {
  field: ContentfulTextFieldsEnum;
};


type ContentfulTextConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: ContentfulTextFieldsEnum;
};

type ContentfulTextEdge = {
  readonly next: Maybe<ContentfulText>;
  readonly node: ContentfulText;
  readonly previous: Maybe<ContentfulText>;
};

type ContentfulTextFieldsEnum =
  | 'contentful_id'
  | 'id'
  | 'node_locale'
  | 'identifier'
  | 'text.raw'
  | 'imageType'
  | 'page'
  | 'page.contentful_id'
  | 'page.id'
  | 'page.node_locale'
  | 'page.title'
  | 'page.slug'
  | 'page.spaceId'
  | 'page.createdAt'
  | 'page.updatedAt'
  | 'page.sys.type'
  | 'page.sys.revision'
  | 'page.parent.id'
  | 'page.parent.parent.id'
  | 'page.parent.parent.children'
  | 'page.parent.children'
  | 'page.parent.children.id'
  | 'page.parent.children.children'
  | 'page.parent.internal.content'
  | 'page.parent.internal.contentDigest'
  | 'page.parent.internal.description'
  | 'page.parent.internal.fieldOwners'
  | 'page.parent.internal.ignoreType'
  | 'page.parent.internal.mediaType'
  | 'page.parent.internal.owner'
  | 'page.parent.internal.type'
  | 'page.children'
  | 'page.children.id'
  | 'page.children.parent.id'
  | 'page.children.parent.children'
  | 'page.children.children'
  | 'page.children.children.id'
  | 'page.children.children.children'
  | 'page.children.internal.content'
  | 'page.children.internal.contentDigest'
  | 'page.children.internal.description'
  | 'page.children.internal.fieldOwners'
  | 'page.children.internal.ignoreType'
  | 'page.children.internal.mediaType'
  | 'page.children.internal.owner'
  | 'page.children.internal.type'
  | 'page.internal.content'
  | 'page.internal.contentDigest'
  | 'page.internal.description'
  | 'page.internal.fieldOwners'
  | 'page.internal.ignoreType'
  | 'page.internal.mediaType'
  | 'page.internal.owner'
  | 'page.internal.type'
  | 'spaceId'
  | 'createdAt'
  | 'updatedAt'
  | 'sys.type'
  | 'sys.revision'
  | 'sys.contentType.sys.type'
  | 'sys.contentType.sys.linkType'
  | 'sys.contentType.sys.id'
  | 'image.contentful_id'
  | 'image.id'
  | 'image.spaceId'
  | 'image.createdAt'
  | 'image.updatedAt'
  | 'image.file.url'
  | 'image.file.details.size'
  | 'image.file.fileName'
  | 'image.file.contentType'
  | 'image.title'
  | 'image.description'
  | 'image.node_locale'
  | 'image.sys.type'
  | 'image.sys.revision'
  | 'image.fixed.base64'
  | 'image.fixed.tracedSVG'
  | 'image.fixed.aspectRatio'
  | 'image.fixed.width'
  | 'image.fixed.height'
  | 'image.fixed.src'
  | 'image.fixed.srcSet'
  | 'image.fixed.srcWebp'
  | 'image.fixed.srcSetWebp'
  | 'image.fluid.base64'
  | 'image.fluid.tracedSVG'
  | 'image.fluid.aspectRatio'
  | 'image.fluid.src'
  | 'image.fluid.srcSet'
  | 'image.fluid.srcWebp'
  | 'image.fluid.srcSetWebp'
  | 'image.fluid.sizes'
  | 'image.gatsbyImageData'
  | 'image.resize.base64'
  | 'image.resize.tracedSVG'
  | 'image.resize.src'
  | 'image.resize.width'
  | 'image.resize.height'
  | 'image.resize.aspectRatio'
  | 'image.parent.id'
  | 'image.parent.parent.id'
  | 'image.parent.parent.children'
  | 'image.parent.children'
  | 'image.parent.children.id'
  | 'image.parent.children.children'
  | 'image.parent.internal.content'
  | 'image.parent.internal.contentDigest'
  | 'image.parent.internal.description'
  | 'image.parent.internal.fieldOwners'
  | 'image.parent.internal.ignoreType'
  | 'image.parent.internal.mediaType'
  | 'image.parent.internal.owner'
  | 'image.parent.internal.type'
  | 'image.children'
  | 'image.children.id'
  | 'image.children.parent.id'
  | 'image.children.parent.children'
  | 'image.children.children'
  | 'image.children.children.id'
  | 'image.children.children.children'
  | 'image.children.internal.content'
  | 'image.children.internal.contentDigest'
  | 'image.children.internal.description'
  | 'image.children.internal.fieldOwners'
  | 'image.children.internal.ignoreType'
  | 'image.children.internal.mediaType'
  | 'image.children.internal.owner'
  | 'image.children.internal.type'
  | 'image.internal.content'
  | 'image.internal.contentDigest'
  | 'image.internal.description'
  | 'image.internal.fieldOwners'
  | 'image.internal.ignoreType'
  | 'image.internal.mediaType'
  | 'image.internal.owner'
  | 'image.internal.type'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type';

type ContentfulTextGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulTextEdge>;
  readonly nodes: ReadonlyArray<ContentfulText>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type ContentfulTextFilterInput = {
  readonly contentful_id: Maybe<StringQueryOperatorInput>;
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly node_locale: Maybe<StringQueryOperatorInput>;
  readonly identifier: Maybe<StringQueryOperatorInput>;
  readonly text: Maybe<ContentfulTextTextFilterInput>;
  readonly imageType: Maybe<StringQueryOperatorInput>;
  readonly page: Maybe<ContentfulPageFilterListInput>;
  readonly spaceId: Maybe<StringQueryOperatorInput>;
  readonly createdAt: Maybe<DateQueryOperatorInput>;
  readonly updatedAt: Maybe<DateQueryOperatorInput>;
  readonly sys: Maybe<ContentfulTextSysFilterInput>;
  readonly image: Maybe<ContentfulAssetFilterInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
};

type ContentfulTextSortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<ContentfulTextFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type GithubDataDataFilterInput = {
  readonly repository: Maybe<GithubDataDataRepositoryFilterInput>;
};

type GithubDataDataRepositoryFilterInput = {
  readonly refs: Maybe<GithubDataDataRepositoryRefsFilterInput>;
};

type GithubDataDataRepositoryRefsFilterInput = {
  readonly nodes: Maybe<GithubDataDataRepositoryRefsNodesFilterListInput>;
};

type GithubDataDataRepositoryRefsNodesFilterListInput = {
  readonly elemMatch: Maybe<GithubDataDataRepositoryRefsNodesFilterInput>;
};

type GithubDataDataRepositoryRefsNodesFilterInput = {
  readonly name: Maybe<StringQueryOperatorInput>;
  readonly target: Maybe<GithubDataDataRepositoryRefsNodesTargetFilterInput>;
};

type GithubDataDataRepositoryRefsNodesTargetFilterInput = {
  readonly oid: Maybe<StringQueryOperatorInput>;
};

type GithubDataRawResultFilterInput = {
  readonly data: Maybe<GithubDataRawResultDataFilterInput>;
};

type GithubDataRawResultDataFilterInput = {
  readonly repository: Maybe<GithubDataRawResultDataRepositoryFilterInput>;
};

type GithubDataRawResultDataRepositoryFilterInput = {
  readonly refs: Maybe<GithubDataRawResultDataRepositoryRefsFilterInput>;
};

type GithubDataRawResultDataRepositoryRefsFilterInput = {
  readonly nodes: Maybe<GithubDataRawResultDataRepositoryRefsNodesFilterListInput>;
};

type GithubDataRawResultDataRepositoryRefsNodesFilterListInput = {
  readonly elemMatch: Maybe<GithubDataRawResultDataRepositoryRefsNodesFilterInput>;
};

type GithubDataRawResultDataRepositoryRefsNodesFilterInput = {
  readonly name: Maybe<StringQueryOperatorInput>;
  readonly target: Maybe<GithubDataRawResultDataRepositoryRefsNodesTargetFilterInput>;
};

type GithubDataRawResultDataRepositoryRefsNodesTargetFilterInput = {
  readonly oid: Maybe<StringQueryOperatorInput>;
};

type GithubDataConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<GithubDataEdge>;
  readonly nodes: ReadonlyArray<GithubData>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<GithubDataGroupConnection>;
};


type GithubDataConnection_distinctArgs = {
  field: GithubDataFieldsEnum;
};


type GithubDataConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: GithubDataFieldsEnum;
};

type GithubDataEdge = {
  readonly next: Maybe<GithubData>;
  readonly node: GithubData;
  readonly previous: Maybe<GithubData>;
};

type GithubDataFieldsEnum =
  | 'id'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type'
  | 'data.repository.refs.nodes';

type GithubDataGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<GithubDataEdge>;
  readonly nodes: ReadonlyArray<GithubData>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type GithubDataFilterInput = {
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
  readonly data: Maybe<GithubDataDataFilterInput>;
  readonly rawResult: Maybe<GithubDataRawResultFilterInput>;
};

type GithubDataSortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<GithubDataFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type contentfulLinkIconTextNodeConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<contentfulLinkIconTextNodeEdge>;
  readonly nodes: ReadonlyArray<contentfulLinkIconTextNode>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<contentfulLinkIconTextNodeGroupConnection>;
};


type contentfulLinkIconTextNodeConnection_distinctArgs = {
  field: contentfulLinkIconTextNodeFieldsEnum;
};


type contentfulLinkIconTextNodeConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: contentfulLinkIconTextNodeFieldsEnum;
};

type contentfulLinkIconTextNodeEdge = {
  readonly next: Maybe<contentfulLinkIconTextNode>;
  readonly node: contentfulLinkIconTextNode;
  readonly previous: Maybe<contentfulLinkIconTextNode>;
};

type contentfulLinkIconTextNodeFieldsEnum =
  | 'id'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type'
  | 'icon'
  | 'sys.type';

type contentfulLinkIconTextNodeGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<contentfulLinkIconTextNodeEdge>;
  readonly nodes: ReadonlyArray<contentfulLinkIconTextNode>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type contentfulLinkIconTextNodeSortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<contentfulLinkIconTextNodeFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type ContentfulContentTypeSysFilterInput = {
  readonly type: Maybe<StringQueryOperatorInput>;
};

type ContentfulContentTypeConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulContentTypeEdge>;
  readonly nodes: ReadonlyArray<ContentfulContentType>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<ContentfulContentTypeGroupConnection>;
};


type ContentfulContentTypeConnection_distinctArgs = {
  field: ContentfulContentTypeFieldsEnum;
};


type ContentfulContentTypeConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: ContentfulContentTypeFieldsEnum;
};

type ContentfulContentTypeEdge = {
  readonly next: Maybe<ContentfulContentType>;
  readonly node: ContentfulContentType;
  readonly previous: Maybe<ContentfulContentType>;
};

type ContentfulContentTypeFieldsEnum =
  | 'id'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type'
  | 'name'
  | 'displayField'
  | 'description'
  | 'sys.type';

type ContentfulContentTypeGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<ContentfulContentTypeEdge>;
  readonly nodes: ReadonlyArray<ContentfulContentType>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type ContentfulContentTypeFilterInput = {
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
  readonly name: Maybe<StringQueryOperatorInput>;
  readonly displayField: Maybe<StringQueryOperatorInput>;
  readonly description: Maybe<StringQueryOperatorInput>;
  readonly sys: Maybe<ContentfulContentTypeSysFilterInput>;
};

type ContentfulContentTypeSortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<ContentfulContentTypeFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type SiteBuildMetadataConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<SiteBuildMetadataEdge>;
  readonly nodes: ReadonlyArray<SiteBuildMetadata>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<SiteBuildMetadataGroupConnection>;
};


type SiteBuildMetadataConnection_distinctArgs = {
  field: SiteBuildMetadataFieldsEnum;
};


type SiteBuildMetadataConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: SiteBuildMetadataFieldsEnum;
};

type SiteBuildMetadataEdge = {
  readonly next: Maybe<SiteBuildMetadata>;
  readonly node: SiteBuildMetadata;
  readonly previous: Maybe<SiteBuildMetadata>;
};

type SiteBuildMetadataFieldsEnum =
  | 'id'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type'
  | 'buildTime';

type SiteBuildMetadataGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<SiteBuildMetadataEdge>;
  readonly nodes: ReadonlyArray<SiteBuildMetadata>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type SiteBuildMetadataFilterInput = {
  readonly id: Maybe<StringQueryOperatorInput>;
  readonly parent: Maybe<NodeFilterInput>;
  readonly children: Maybe<NodeFilterListInput>;
  readonly internal: Maybe<InternalFilterInput>;
  readonly buildTime: Maybe<DateQueryOperatorInput>;
};

type SiteBuildMetadataSortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<SiteBuildMetadataFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type SitePluginConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<SitePluginEdge>;
  readonly nodes: ReadonlyArray<SitePlugin>;
  readonly pageInfo: PageInfo;
  readonly distinct: ReadonlyArray<Scalars['String']>;
  readonly group: ReadonlyArray<SitePluginGroupConnection>;
};


type SitePluginConnection_distinctArgs = {
  field: SitePluginFieldsEnum;
};


type SitePluginConnection_groupArgs = {
  skip: Maybe<Scalars['Int']>;
  limit: Maybe<Scalars['Int']>;
  field: SitePluginFieldsEnum;
};

type SitePluginEdge = {
  readonly next: Maybe<SitePlugin>;
  readonly node: SitePlugin;
  readonly previous: Maybe<SitePlugin>;
};

type SitePluginFieldsEnum =
  | 'id'
  | 'parent.id'
  | 'parent.parent.id'
  | 'parent.parent.parent.id'
  | 'parent.parent.parent.children'
  | 'parent.parent.children'
  | 'parent.parent.children.id'
  | 'parent.parent.children.children'
  | 'parent.parent.internal.content'
  | 'parent.parent.internal.contentDigest'
  | 'parent.parent.internal.description'
  | 'parent.parent.internal.fieldOwners'
  | 'parent.parent.internal.ignoreType'
  | 'parent.parent.internal.mediaType'
  | 'parent.parent.internal.owner'
  | 'parent.parent.internal.type'
  | 'parent.children'
  | 'parent.children.id'
  | 'parent.children.parent.id'
  | 'parent.children.parent.children'
  | 'parent.children.children'
  | 'parent.children.children.id'
  | 'parent.children.children.children'
  | 'parent.children.internal.content'
  | 'parent.children.internal.contentDigest'
  | 'parent.children.internal.description'
  | 'parent.children.internal.fieldOwners'
  | 'parent.children.internal.ignoreType'
  | 'parent.children.internal.mediaType'
  | 'parent.children.internal.owner'
  | 'parent.children.internal.type'
  | 'parent.internal.content'
  | 'parent.internal.contentDigest'
  | 'parent.internal.description'
  | 'parent.internal.fieldOwners'
  | 'parent.internal.ignoreType'
  | 'parent.internal.mediaType'
  | 'parent.internal.owner'
  | 'parent.internal.type'
  | 'children'
  | 'children.id'
  | 'children.parent.id'
  | 'children.parent.parent.id'
  | 'children.parent.parent.children'
  | 'children.parent.children'
  | 'children.parent.children.id'
  | 'children.parent.children.children'
  | 'children.parent.internal.content'
  | 'children.parent.internal.contentDigest'
  | 'children.parent.internal.description'
  | 'children.parent.internal.fieldOwners'
  | 'children.parent.internal.ignoreType'
  | 'children.parent.internal.mediaType'
  | 'children.parent.internal.owner'
  | 'children.parent.internal.type'
  | 'children.children'
  | 'children.children.id'
  | 'children.children.parent.id'
  | 'children.children.parent.children'
  | 'children.children.children'
  | 'children.children.children.id'
  | 'children.children.children.children'
  | 'children.children.internal.content'
  | 'children.children.internal.contentDigest'
  | 'children.children.internal.description'
  | 'children.children.internal.fieldOwners'
  | 'children.children.internal.ignoreType'
  | 'children.children.internal.mediaType'
  | 'children.children.internal.owner'
  | 'children.children.internal.type'
  | 'children.internal.content'
  | 'children.internal.contentDigest'
  | 'children.internal.description'
  | 'children.internal.fieldOwners'
  | 'children.internal.ignoreType'
  | 'children.internal.mediaType'
  | 'children.internal.owner'
  | 'children.internal.type'
  | 'internal.content'
  | 'internal.contentDigest'
  | 'internal.description'
  | 'internal.fieldOwners'
  | 'internal.ignoreType'
  | 'internal.mediaType'
  | 'internal.owner'
  | 'internal.type'
  | 'resolve'
  | 'name'
  | 'version'
  | 'pluginOptions.accessToken'
  | 'pluginOptions.spaceId'
  | 'pluginOptions.host'
  | 'pluginOptions.useNameForId'
  | 'pluginOptions.environment'
  | 'pluginOptions.downloadLocal'
  | 'pluginOptions.forceFullSync'
  | 'pluginOptions.pageLimit'
  | 'pluginOptions.assetDownloadWorkers'
  | 'pluginOptions.token'
  | 'pluginOptions.graphQLQuery'
  | 'pluginOptions.output'
  | 'pluginOptions.createLinkInHead'
  | 'pluginOptions.name'
  | 'pluginOptions.short_name'
  | 'pluginOptions.start_url'
  | 'pluginOptions.background_color'
  | 'pluginOptions.theme_color'
  | 'pluginOptions.display'
  | 'pluginOptions.icon'
  | 'pluginOptions.legacy'
  | 'pluginOptions.theme_color_in_head'
  | 'pluginOptions.cache_busting_mode'
  | 'pluginOptions.crossOrigin'
  | 'pluginOptions.include_favicon'
  | 'pluginOptions.cacheDigest'
  | 'pluginOptions.base64Width'
  | 'pluginOptions.stripMetadata'
  | 'pluginOptions.defaultQuality'
  | 'pluginOptions.failOnError'
  | 'pluginOptions.path'
  | 'pluginOptions.outputPath'
  | 'pluginOptions.configDir'
  | 'pluginOptions.pathCheck'
  | 'pluginOptions.allExtensions'
  | 'pluginOptions.isTSX'
  | 'pluginOptions.jsxPragma'
  | 'nodeAPIs'
  | 'browserAPIs'
  | 'ssrAPIs'
  | 'pluginFilepath'
  | 'packageJson.name'
  | 'packageJson.description'
  | 'packageJson.version'
  | 'packageJson.main'
  | 'packageJson.license'
  | 'packageJson.dependencies'
  | 'packageJson.dependencies.name'
  | 'packageJson.dependencies.version'
  | 'packageJson.devDependencies'
  | 'packageJson.devDependencies.name'
  | 'packageJson.devDependencies.version'
  | 'packageJson.peerDependencies'
  | 'packageJson.peerDependencies.name'
  | 'packageJson.peerDependencies.version'
  | 'packageJson.keywords';

type SitePluginGroupConnection = {
  readonly totalCount: Scalars['Int'];
  readonly edges: ReadonlyArray<SitePluginEdge>;
  readonly nodes: ReadonlyArray<SitePlugin>;
  readonly pageInfo: PageInfo;
  readonly field: Scalars['String'];
  readonly fieldValue: Maybe<Scalars['String']>;
};

type SitePluginSortInput = {
  readonly fields: Maybe<ReadonlyArray<Maybe<SitePluginFieldsEnum>>>;
  readonly order: Maybe<ReadonlyArray<Maybe<SortOrderEnum>>>;
};

type PagesQueryQueryVariables = Exact<{ [key: string]: never; }>;


type PagesQueryQuery = { readonly allSitePage: { readonly nodes: ReadonlyArray<Pick<SitePage, 'path'>> } };

type FooterQueryVariables = Exact<{ [key: string]: never; }>;


type FooterQuery = { readonly allContentfulSection: { readonly edges: ReadonlyArray<{ readonly node: { readonly blocks: Maybe<ReadonlyArray<Maybe<Pick<ContentfulLink, 'title' | 'url'> | { readonly blocks: Maybe<ReadonlyArray<Maybe<(
            Pick<ContentfulLink, 'url' | 'title'>
            & { readonly icon: Maybe<Pick<contentfulLinkIconTextNode, 'icon'>> }
          )>>> }>>> } }> } };

type GatsbyImageSharpFixedFragment = Pick<ImageSharpFixed, 'base64' | 'width' | 'height' | 'src' | 'srcSet'>;

type GatsbyImageSharpFixed_tracedSVGFragment = Pick<ImageSharpFixed, 'tracedSVG' | 'width' | 'height' | 'src' | 'srcSet'>;

type GatsbyImageSharpFixed_withWebpFragment = Pick<ImageSharpFixed, 'base64' | 'width' | 'height' | 'src' | 'srcSet' | 'srcWebp' | 'srcSetWebp'>;

type GatsbyImageSharpFixed_withWebp_tracedSVGFragment = Pick<ImageSharpFixed, 'tracedSVG' | 'width' | 'height' | 'src' | 'srcSet' | 'srcWebp' | 'srcSetWebp'>;

type GatsbyImageSharpFixed_noBase64Fragment = Pick<ImageSharpFixed, 'width' | 'height' | 'src' | 'srcSet'>;

type GatsbyImageSharpFixed_withWebp_noBase64Fragment = Pick<ImageSharpFixed, 'width' | 'height' | 'src' | 'srcSet' | 'srcWebp' | 'srcSetWebp'>;

type GatsbyImageSharpFluidFragment = Pick<ImageSharpFluid, 'base64' | 'aspectRatio' | 'src' | 'srcSet' | 'sizes'>;

type GatsbyImageSharpFluidLimitPresentationSizeFragment = { maxHeight: ImageSharpFluid['presentationHeight'], maxWidth: ImageSharpFluid['presentationWidth'] };

type GatsbyImageSharpFluid_tracedSVGFragment = Pick<ImageSharpFluid, 'tracedSVG' | 'aspectRatio' | 'src' | 'srcSet' | 'sizes'>;

type GatsbyImageSharpFluid_withWebpFragment = Pick<ImageSharpFluid, 'base64' | 'aspectRatio' | 'src' | 'srcSet' | 'srcWebp' | 'srcSetWebp' | 'sizes'>;

type GatsbyImageSharpFluid_withWebp_tracedSVGFragment = Pick<ImageSharpFluid, 'tracedSVG' | 'aspectRatio' | 'src' | 'srcSet' | 'srcWebp' | 'srcSetWebp' | 'sizes'>;

type GatsbyImageSharpFluid_noBase64Fragment = Pick<ImageSharpFluid, 'aspectRatio' | 'src' | 'srcSet' | 'sizes'>;

type GatsbyImageSharpFluid_withWebp_noBase64Fragment = Pick<ImageSharpFluid, 'aspectRatio' | 'src' | 'srcSet' | 'srcWebp' | 'srcSetWebp' | 'sizes'>;

type SiteVersionQueryVariables = Exact<{ [key: string]: never; }>;


type SiteVersionQuery = { readonly githubData: Maybe<{ readonly data: Maybe<{ readonly repository: Maybe<{ readonly refs: Maybe<{ readonly nodes: Maybe<ReadonlyArray<Maybe<(
            Pick<GithubDataDataRepositoryRefsNodes, 'name'>
            & { readonly target: Maybe<Pick<GithubDataDataRepositoryRefsNodesTarget, 'oid'>> }
          )>>> }> }> }> }> };

type HeaderQueryVariables = Exact<{ [key: string]: never; }>;


type HeaderQuery = { readonly allContentfulSection: { readonly edges: ReadonlyArray<{ readonly node: { readonly blocks: Maybe<ReadonlyArray<Maybe<Pick<ContentfulLink, 'title' | 'url'>>>> } }> } };

type GatsbyContentfulFixedFragment = Pick<ContentfulFixed, 'base64' | 'width' | 'height' | 'src' | 'srcSet'>;

type GatsbyContentfulFixed_tracedSVGFragment = Pick<ContentfulFixed, 'tracedSVG' | 'width' | 'height' | 'src' | 'srcSet'>;

type GatsbyContentfulFixed_noBase64Fragment = Pick<ContentfulFixed, 'width' | 'height' | 'src' | 'srcSet'>;

type GatsbyContentfulFixed_withWebpFragment = Pick<ContentfulFixed, 'base64' | 'width' | 'height' | 'src' | 'srcSet' | 'srcWebp' | 'srcSetWebp'>;

type GatsbyContentfulFixed_withWebp_noBase64Fragment = Pick<ContentfulFixed, 'width' | 'height' | 'src' | 'srcSet' | 'srcWebp' | 'srcSetWebp'>;

type GatsbyContentfulFluidFragment = Pick<ContentfulFluid, 'base64' | 'aspectRatio' | 'src' | 'srcSet' | 'sizes'>;

type GatsbyContentfulFluid_tracedSVGFragment = Pick<ContentfulFluid, 'tracedSVG' | 'aspectRatio' | 'src' | 'srcSet' | 'sizes'>;

type GatsbyContentfulFluid_noBase64Fragment = Pick<ContentfulFluid, 'aspectRatio' | 'src' | 'srcSet' | 'sizes'>;

type GatsbyContentfulFluid_withWebpFragment = Pick<ContentfulFluid, 'base64' | 'aspectRatio' | 'src' | 'srcSet' | 'srcWebp' | 'srcSetWebp' | 'sizes'>;

type GatsbyContentfulFluid_withWebp_noBase64Fragment = Pick<ContentfulFluid, 'aspectRatio' | 'src' | 'srcSet' | 'srcWebp' | 'srcSetWebp' | 'sizes'>;

}