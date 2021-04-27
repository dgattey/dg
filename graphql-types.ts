export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = {
	[K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
	{ [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
	{ [SubKey in K]: Maybe<T[SubKey]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	/** The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID. */
	ID: string
	/** The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
	String: string
	/** The `Boolean` scalar type represents `true` or `false`. */
	Boolean: boolean
	/** The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. */
	Int: number
	/** The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
	Float: number
	/** A date string, such as 2007-12-03, compliant with the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
	Date: any
	/** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
	JSON: any
}

export type File = Node & {
	sourceInstanceName: Scalars['String']
	absolutePath: Scalars['String']
	relativePath: Scalars['String']
	extension: Scalars['String']
	size: Scalars['Int']
	prettySize: Scalars['String']
	modifiedTime: Scalars['Date']
	accessTime: Scalars['Date']
	changeTime: Scalars['Date']
	birthTime: Scalars['Date']
	root: Scalars['String']
	dir: Scalars['String']
	base: Scalars['String']
	ext: Scalars['String']
	name: Scalars['String']
	relativeDirectory: Scalars['String']
	dev: Scalars['Int']
	mode: Scalars['Int']
	nlink: Scalars['Int']
	uid: Scalars['Int']
	gid: Scalars['Int']
	rdev: Scalars['Int']
	ino: Scalars['Float']
	atimeMs: Scalars['Float']
	mtimeMs: Scalars['Float']
	ctimeMs: Scalars['Float']
	atime: Scalars['Date']
	mtime: Scalars['Date']
	ctime: Scalars['Date']
	/** @deprecated Use `birthTime` instead */
	birthtime?: Maybe<Scalars['Date']>
	/** @deprecated Use `birthTime` instead */
	birthtimeMs?: Maybe<Scalars['Float']>
	blksize?: Maybe<Scalars['Int']>
	blocks?: Maybe<Scalars['Int']>
	/** Copy file to static directory and return public url to it */
	publicURL?: Maybe<Scalars['String']>
	/** Returns all children nodes filtered by type ImageSharp */
	childrenImageSharp?: Maybe<Array<Maybe<ImageSharp>>>
	/** Returns the first child node of type ImageSharp or null if there are no children of given type on this node */
	childImageSharp?: Maybe<ImageSharp>
	id: Scalars['ID']
	parent?: Maybe<Node>
	children: Array<Node>
	internal: Internal
}

export type FileModifiedTimeArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type FileAccessTimeArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type FileChangeTimeArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type FileBirthTimeArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type FileAtimeArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type FileMtimeArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type FileCtimeArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

/** Node Interface */
export type Node = {
	id: Scalars['ID']
	parent?: Maybe<Node>
	children: Array<Node>
	internal: Internal
}

export type Internal = {
	content?: Maybe<Scalars['String']>
	contentDigest: Scalars['String']
	description?: Maybe<Scalars['String']>
	fieldOwners?: Maybe<Array<Maybe<Scalars['String']>>>
	ignoreType?: Maybe<Scalars['Boolean']>
	mediaType?: Maybe<Scalars['String']>
	owner: Scalars['String']
	type: Scalars['String']
}

export type Directory = Node & {
	sourceInstanceName: Scalars['String']
	absolutePath: Scalars['String']
	relativePath: Scalars['String']
	extension: Scalars['String']
	size: Scalars['Int']
	prettySize: Scalars['String']
	modifiedTime: Scalars['Date']
	accessTime: Scalars['Date']
	changeTime: Scalars['Date']
	birthTime: Scalars['Date']
	root: Scalars['String']
	dir: Scalars['String']
	base: Scalars['String']
	ext: Scalars['String']
	name: Scalars['String']
	relativeDirectory: Scalars['String']
	dev: Scalars['Int']
	mode: Scalars['Int']
	nlink: Scalars['Int']
	uid: Scalars['Int']
	gid: Scalars['Int']
	rdev: Scalars['Int']
	ino: Scalars['Float']
	atimeMs: Scalars['Float']
	mtimeMs: Scalars['Float']
	ctimeMs: Scalars['Float']
	atime: Scalars['Date']
	mtime: Scalars['Date']
	ctime: Scalars['Date']
	/** @deprecated Use `birthTime` instead */
	birthtime?: Maybe<Scalars['Date']>
	/** @deprecated Use `birthTime` instead */
	birthtimeMs?: Maybe<Scalars['Float']>
	blksize?: Maybe<Scalars['Int']>
	blocks?: Maybe<Scalars['Int']>
	id: Scalars['ID']
	parent?: Maybe<Node>
	children: Array<Node>
	internal: Internal
}

export type DirectoryModifiedTimeArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type DirectoryAccessTimeArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type DirectoryChangeTimeArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type DirectoryBirthTimeArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type DirectoryAtimeArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type DirectoryMtimeArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type DirectoryCtimeArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type Site = Node & {
	buildTime?: Maybe<Scalars['Date']>
	siteMetadata?: Maybe<SiteSiteMetadata>
	port?: Maybe<Scalars['Int']>
	host?: Maybe<Scalars['String']>
	polyfill?: Maybe<Scalars['Boolean']>
	pathPrefix?: Maybe<Scalars['String']>
	id: Scalars['ID']
	parent?: Maybe<Node>
	children: Array<Node>
	internal: Internal
}

export type SiteBuildTimeArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type SiteSiteMetadata = {
	title?: Maybe<Scalars['String']>
	description?: Maybe<Scalars['String']>
	author?: Maybe<Scalars['String']>
	siteUrl?: Maybe<Scalars['String']>
}

export type SitePage = Node & {
	path: Scalars['String']
	component: Scalars['String']
	internalComponentName: Scalars['String']
	componentChunkName: Scalars['String']
	matchPath?: Maybe<Scalars['String']>
	id: Scalars['ID']
	parent?: Maybe<Node>
	children: Array<Node>
	internal: Internal
	isCreatedByStatefulCreatePages?: Maybe<Scalars['Boolean']>
	context?: Maybe<SitePageContext>
	pluginCreator?: Maybe<SitePlugin>
	pluginCreatorId?: Maybe<Scalars['String']>
	componentPath?: Maybe<Scalars['String']>
}

export type SitePageContext = {
	id?: Maybe<Scalars['String']>
}

export type ImageFormat = 'NO_CHANGE' | 'AUTO' | 'JPG' | 'PNG' | 'WEBP' | 'AVIF'

export type ImageFit = 'COVER' | 'CONTAIN' | 'FILL' | 'INSIDE' | 'OUTSIDE'

export type ImageLayout = 'FIXED' | 'FULL_WIDTH' | 'CONSTRAINED'

export type ImageCropFocus =
	| 'CENTER'
	| 'NORTH'
	| 'NORTHEAST'
	| 'EAST'
	| 'SOUTHEAST'
	| 'SOUTH'
	| 'SOUTHWEST'
	| 'WEST'
	| 'NORTHWEST'
	| 'ENTROPY'
	| 'ATTENTION'

export type DuotoneGradient = {
	highlight: Scalars['String']
	shadow: Scalars['String']
	opacity?: Maybe<Scalars['Int']>
}

export type PotraceTurnPolicy =
	| 'TURNPOLICY_BLACK'
	| 'TURNPOLICY_WHITE'
	| 'TURNPOLICY_LEFT'
	| 'TURNPOLICY_RIGHT'
	| 'TURNPOLICY_MINORITY'
	| 'TURNPOLICY_MAJORITY'

export type Potrace = {
	turnPolicy?: Maybe<PotraceTurnPolicy>
	turdSize?: Maybe<Scalars['Float']>
	alphaMax?: Maybe<Scalars['Float']>
	optCurve?: Maybe<Scalars['Boolean']>
	optTolerance?: Maybe<Scalars['Float']>
	threshold?: Maybe<Scalars['Int']>
	blackOnWhite?: Maybe<Scalars['Boolean']>
	color?: Maybe<Scalars['String']>
	background?: Maybe<Scalars['String']>
}

export type ImageSharp = Node & {
	fixed?: Maybe<ImageSharpFixed>
	fluid?: Maybe<ImageSharpFluid>
	gatsbyImageData: Scalars['JSON']
	original?: Maybe<ImageSharpOriginal>
	resize?: Maybe<ImageSharpResize>
	id: Scalars['ID']
	parent?: Maybe<Node>
	children: Array<Node>
	internal: Internal
}

export type ImageSharpFixedArgs = {
	width?: Maybe<Scalars['Int']>
	height?: Maybe<Scalars['Int']>
	base64Width?: Maybe<Scalars['Int']>
	jpegProgressive?: Maybe<Scalars['Boolean']>
	pngCompressionSpeed?: Maybe<Scalars['Int']>
	grayscale?: Maybe<Scalars['Boolean']>
	duotone?: Maybe<DuotoneGradient>
	traceSVG?: Maybe<Potrace>
	quality?: Maybe<Scalars['Int']>
	jpegQuality?: Maybe<Scalars['Int']>
	pngQuality?: Maybe<Scalars['Int']>
	webpQuality?: Maybe<Scalars['Int']>
	toFormat?: Maybe<ImageFormat>
	toFormatBase64?: Maybe<ImageFormat>
	cropFocus?: Maybe<ImageCropFocus>
	fit?: Maybe<ImageFit>
	background?: Maybe<Scalars['String']>
	rotate?: Maybe<Scalars['Int']>
	trim?: Maybe<Scalars['Float']>
}

export type ImageSharpFluidArgs = {
	maxWidth?: Maybe<Scalars['Int']>
	maxHeight?: Maybe<Scalars['Int']>
	base64Width?: Maybe<Scalars['Int']>
	grayscale?: Maybe<Scalars['Boolean']>
	jpegProgressive?: Maybe<Scalars['Boolean']>
	pngCompressionSpeed?: Maybe<Scalars['Int']>
	duotone?: Maybe<DuotoneGradient>
	traceSVG?: Maybe<Potrace>
	quality?: Maybe<Scalars['Int']>
	jpegQuality?: Maybe<Scalars['Int']>
	pngQuality?: Maybe<Scalars['Int']>
	webpQuality?: Maybe<Scalars['Int']>
	toFormat?: Maybe<ImageFormat>
	toFormatBase64?: Maybe<ImageFormat>
	cropFocus?: Maybe<ImageCropFocus>
	fit?: Maybe<ImageFit>
	background?: Maybe<Scalars['String']>
	rotate?: Maybe<Scalars['Int']>
	trim?: Maybe<Scalars['Float']>
	sizes?: Maybe<Scalars['String']>
	srcSetBreakpoints?: Maybe<Array<Maybe<Scalars['Int']>>>
}

export type ImageSharpGatsbyImageDataArgs = {
	layout?: Maybe<ImageLayout>
	width?: Maybe<Scalars['Int']>
	height?: Maybe<Scalars['Int']>
	aspectRatio?: Maybe<Scalars['Float']>
	placeholder?: Maybe<ImagePlaceholder>
	blurredOptions?: Maybe<BlurredOptions>
	tracedSVGOptions?: Maybe<Potrace>
	formats?: Maybe<Array<Maybe<ImageFormat>>>
	outputPixelDensities?: Maybe<Array<Maybe<Scalars['Float']>>>
	breakpoints?: Maybe<Array<Maybe<Scalars['Int']>>>
	sizes?: Maybe<Scalars['String']>
	quality?: Maybe<Scalars['Int']>
	jpgOptions?: Maybe<JpgOptions>
	pngOptions?: Maybe<PngOptions>
	webpOptions?: Maybe<WebPOptions>
	avifOptions?: Maybe<AvifOptions>
	transformOptions?: Maybe<TransformOptions>
	backgroundColor?: Maybe<Scalars['String']>
}

export type ImageSharpResizeArgs = {
	width?: Maybe<Scalars['Int']>
	height?: Maybe<Scalars['Int']>
	quality?: Maybe<Scalars['Int']>
	jpegQuality?: Maybe<Scalars['Int']>
	pngQuality?: Maybe<Scalars['Int']>
	webpQuality?: Maybe<Scalars['Int']>
	jpegProgressive?: Maybe<Scalars['Boolean']>
	pngCompressionLevel?: Maybe<Scalars['Int']>
	pngCompressionSpeed?: Maybe<Scalars['Int']>
	grayscale?: Maybe<Scalars['Boolean']>
	duotone?: Maybe<DuotoneGradient>
	base64?: Maybe<Scalars['Boolean']>
	traceSVG?: Maybe<Potrace>
	toFormat?: Maybe<ImageFormat>
	cropFocus?: Maybe<ImageCropFocus>
	fit?: Maybe<ImageFit>
	background?: Maybe<Scalars['String']>
	rotate?: Maybe<Scalars['Int']>
	trim?: Maybe<Scalars['Float']>
}

export type ImageSharpFixed = {
	base64?: Maybe<Scalars['String']>
	tracedSVG?: Maybe<Scalars['String']>
	aspectRatio?: Maybe<Scalars['Float']>
	width: Scalars['Float']
	height: Scalars['Float']
	src: Scalars['String']
	srcSet: Scalars['String']
	srcWebp?: Maybe<Scalars['String']>
	srcSetWebp?: Maybe<Scalars['String']>
	originalName?: Maybe<Scalars['String']>
}

export type ImageSharpFluid = {
	base64?: Maybe<Scalars['String']>
	tracedSVG?: Maybe<Scalars['String']>
	aspectRatio: Scalars['Float']
	src: Scalars['String']
	srcSet: Scalars['String']
	srcWebp?: Maybe<Scalars['String']>
	srcSetWebp?: Maybe<Scalars['String']>
	sizes: Scalars['String']
	originalImg?: Maybe<Scalars['String']>
	originalName?: Maybe<Scalars['String']>
	presentationWidth: Scalars['Int']
	presentationHeight: Scalars['Int']
}

export type ImagePlaceholder =
	| 'DOMINANT_COLOR'
	| 'TRACED_SVG'
	| 'BLURRED'
	| 'NONE'

export type BlurredOptions = {
	/** Width of the generated low-res preview. Default is 20px */
	width?: Maybe<Scalars['Int']>
	/** Force the output format for the low-res preview. Default is to use the same format as the input. You should rarely need to change this */
	toFormat?: Maybe<ImageFormat>
}

export type JpgOptions = {
	quality?: Maybe<Scalars['Int']>
	progressive?: Maybe<Scalars['Boolean']>
}

export type PngOptions = {
	quality?: Maybe<Scalars['Int']>
	compressionSpeed?: Maybe<Scalars['Int']>
}

export type WebPOptions = {
	quality?: Maybe<Scalars['Int']>
}

export type AvifOptions = {
	quality?: Maybe<Scalars['Int']>
	lossless?: Maybe<Scalars['Boolean']>
	speed?: Maybe<Scalars['Int']>
}

export type TransformOptions = {
	grayscale?: Maybe<Scalars['Boolean']>
	duotone?: Maybe<DuotoneGradient>
	rotate?: Maybe<Scalars['Int']>
	trim?: Maybe<Scalars['Float']>
	cropFocus?: Maybe<ImageCropFocus>
	fit?: Maybe<ImageFit>
}

export type ImageSharpOriginal = {
	width?: Maybe<Scalars['Float']>
	height?: Maybe<Scalars['Float']>
	src?: Maybe<Scalars['String']>
}

export type ImageSharpResize = {
	src?: Maybe<Scalars['String']>
	tracedSVG?: Maybe<Scalars['String']>
	width?: Maybe<Scalars['Int']>
	height?: Maybe<Scalars['Int']>
	aspectRatio?: Maybe<Scalars['Float']>
	originalName?: Maybe<Scalars['String']>
}

export type ContentfulEntry = {
	contentful_id: Scalars['String']
	id: Scalars['ID']
	node_locale: Scalars['String']
	parent?: Maybe<Node>
	children: Array<Node>
	internal: Internal
}

export type ContentfulReference = {
	contentful_id: Scalars['String']
	id: Scalars['ID']
}

export type ContentfulAsset = ContentfulReference &
	Node & {
		contentful_id: Scalars['String']
		id: Scalars['ID']
		spaceId?: Maybe<Scalars['String']>
		createdAt?: Maybe<Scalars['Date']>
		updatedAt?: Maybe<Scalars['Date']>
		file?: Maybe<ContentfulAssetFile>
		title?: Maybe<Scalars['String']>
		description?: Maybe<Scalars['String']>
		node_locale?: Maybe<Scalars['String']>
		sys?: Maybe<ContentfulAssetSys>
		fixed?: Maybe<ContentfulFixed>
		fluid?: Maybe<ContentfulFluid>
		gatsbyImageData?: Maybe<Scalars['JSON']>
		resize?: Maybe<ContentfulResize>
		parent?: Maybe<Node>
		children: Array<Node>
		internal: Internal
	}

export type ContentfulAssetCreatedAtArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type ContentfulAssetUpdatedAtArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type ContentfulAssetFixedArgs = {
	width?: Maybe<Scalars['Int']>
	height?: Maybe<Scalars['Int']>
	quality?: Maybe<Scalars['Int']>
	toFormat?: Maybe<ContentfulImageFormat>
	resizingBehavior?: Maybe<ImageResizingBehavior>
	cropFocus?: Maybe<ContentfulImageCropFocus>
	background?: Maybe<Scalars['String']>
}

export type ContentfulAssetFluidArgs = {
	maxWidth?: Maybe<Scalars['Int']>
	maxHeight?: Maybe<Scalars['Int']>
	quality?: Maybe<Scalars['Int']>
	toFormat?: Maybe<ContentfulImageFormat>
	resizingBehavior?: Maybe<ImageResizingBehavior>
	cropFocus?: Maybe<ContentfulImageCropFocus>
	background?: Maybe<Scalars['String']>
	sizes?: Maybe<Scalars['String']>
}

export type ContentfulAssetGatsbyImageDataArgs = {
	layout?: Maybe<ContentfulImageLayout>
	width?: Maybe<Scalars['Int']>
	height?: Maybe<Scalars['Int']>
	aspectRatio?: Maybe<Scalars['Float']>
	placeholder?: Maybe<ContentfulImagePlaceholder>
	formats?: Maybe<Array<Maybe<ContentfulImageFormat>>>
	outputPixelDensities?: Maybe<Array<Maybe<Scalars['Float']>>>
	breakpoints?: Maybe<Array<Maybe<Scalars['Int']>>>
	sizes?: Maybe<Scalars['String']>
	backgroundColor?: Maybe<Scalars['String']>
	jpegProgressive?: Maybe<Scalars['Boolean']>
	resizingBehavior?: Maybe<ImageResizingBehavior>
	cropFocus?: Maybe<ContentfulImageCropFocus>
	quality?: Maybe<Scalars['Int']>
}

export type ContentfulAssetResizeArgs = {
	width?: Maybe<Scalars['Int']>
	height?: Maybe<Scalars['Int']>
	quality?: Maybe<Scalars['Int']>
	jpegProgressive?: Maybe<Scalars['Boolean']>
	resizingBehavior?: Maybe<ImageResizingBehavior>
	toFormat?: Maybe<ContentfulImageFormat>
	cropFocus?: Maybe<ContentfulImageCropFocus>
	background?: Maybe<Scalars['String']>
}

export type ContentfulAssetFile = {
	url?: Maybe<Scalars['String']>
	details?: Maybe<ContentfulAssetFileDetails>
	fileName?: Maybe<Scalars['String']>
	contentType?: Maybe<Scalars['String']>
}

export type ContentfulAssetFileDetails = {
	size?: Maybe<Scalars['Int']>
	image?: Maybe<ContentfulAssetFileDetailsImage>
}

export type ContentfulAssetFileDetailsImage = {
	width?: Maybe<Scalars['Int']>
	height?: Maybe<Scalars['Int']>
}

export type ContentfulAssetSys = {
	type?: Maybe<Scalars['String']>
	revision?: Maybe<Scalars['Int']>
}

export type ContentfulFixed = {
	base64?: Maybe<Scalars['String']>
	tracedSVG?: Maybe<Scalars['String']>
	aspectRatio?: Maybe<Scalars['Float']>
	width: Scalars['Float']
	height: Scalars['Float']
	src: Scalars['String']
	srcSet: Scalars['String']
	srcWebp?: Maybe<Scalars['String']>
	srcSetWebp?: Maybe<Scalars['String']>
}

export type ContentfulImageFormat =
	| 'NO_CHANGE'
	| 'AUTO'
	| 'JPG'
	| 'PNG'
	| 'WEBP'

export type ImageResizingBehavior =
	| 'NO_CHANGE'
	/** Same as the default resizing, but adds padding so that the generated image has the specified dimensions. */
	| 'PAD'
	/** Crop a part of the original image to match the specified size. */
	| 'CROP'
	/** Crop the image to the specified dimensions, if the original image is smaller than these dimensions, then the image will be upscaled. */
	| 'FILL'
	/** When used in association with the f parameter below, creates a thumbnail from the image based on a focus area. */
	| 'THUMB'
	/** Scale the image regardless of the original aspect ratio. */
	| 'SCALE'

export type ContentfulImageCropFocus =
	| 'TOP'
	| 'TOP_LEFT'
	| 'TOP_RIGHT'
	| 'BOTTOM'
	| 'BOTTOM_RIGHT'
	| 'BOTTOM_LEFT'
	| 'RIGHT'
	| 'LEFT'
	| 'FACE'
	| 'FACES'
	| 'CENTER'

export type ContentfulFluid = {
	base64?: Maybe<Scalars['String']>
	tracedSVG?: Maybe<Scalars['String']>
	aspectRatio: Scalars['Float']
	src: Scalars['String']
	srcSet: Scalars['String']
	srcWebp?: Maybe<Scalars['String']>
	srcSetWebp?: Maybe<Scalars['String']>
	sizes: Scalars['String']
}

export type ContentfulImageLayout = 'FIXED' | 'FULL_WIDTH' | 'CONSTRAINED'

export type ContentfulImagePlaceholder =
	| 'DOMINANT_COLOR'
	| 'TRACED_SVG'
	| 'BLURRED'
	| 'NONE'

export type ContentfulResize = {
	base64?: Maybe<Scalars['String']>
	tracedSVG?: Maybe<Scalars['String']>
	src?: Maybe<Scalars['String']>
	width?: Maybe<Scalars['Int']>
	height?: Maybe<Scalars['Int']>
	aspectRatio?: Maybe<Scalars['Float']>
}

export type ContentfulProject = ContentfulReference &
	ContentfulEntry &
	Node & {
		contentful_id: Scalars['String']
		id: Scalars['ID']
		node_locale: Scalars['String']
		title?: Maybe<Scalars['String']>
		creationDate?: Maybe<Scalars['Date']>
		type?: Maybe<Array<Maybe<Scalars['String']>>>
		description?: Maybe<ContentfulProjectDescription>
		link?: Maybe<ContentfulLink>
		thumbnail?: Maybe<ContentfulAsset>
		section?: Maybe<Array<Maybe<ContentfulSection>>>
		spaceId?: Maybe<Scalars['String']>
		createdAt?: Maybe<Scalars['Date']>
		updatedAt?: Maybe<Scalars['Date']>
		sys?: Maybe<ContentfulProjectSys>
		parent?: Maybe<Node>
		children: Array<Node>
		internal: Internal
	}

export type ContentfulProjectCreationDateArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type ContentfulProjectCreatedAtArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type ContentfulProjectUpdatedAtArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type ContentfulProjectDescription = {
	raw?: Maybe<Scalars['String']>
}

export type ContentfulProjectSys = {
	type?: Maybe<Scalars['String']>
	revision?: Maybe<Scalars['Int']>
	contentType?: Maybe<ContentfulProjectSysContentType>
}

export type ContentfulProjectSysContentType = {
	sys?: Maybe<ContentfulProjectSysContentTypeSys>
}

export type ContentfulProjectSysContentTypeSys = {
	type?: Maybe<Scalars['String']>
	linkType?: Maybe<Scalars['String']>
	id?: Maybe<Scalars['String']>
}

export type ContentfulBook = ContentfulReference &
	ContentfulEntry &
	Node & {
		contentful_id: Scalars['String']
		id: Scalars['ID']
		node_locale: Scalars['String']
		parent?: Maybe<Node>
		children: Array<Node>
		internal: Internal
	}

export type ContentfulLink = ContentfulReference &
	ContentfulEntry &
	Node & {
		contentful_id: Scalars['String']
		id: Scalars['ID']
		node_locale: Scalars['String']
		title?: Maybe<Scalars['String']>
		url?: Maybe<Scalars['String']>
		section?: Maybe<Array<Maybe<ContentfulSection>>>
		icon?: Maybe<ContentfulLinkIconTextNode>
		spaceId?: Maybe<Scalars['String']>
		createdAt?: Maybe<Scalars['Date']>
		updatedAt?: Maybe<Scalars['Date']>
		sys?: Maybe<ContentfulLinkSys>
		project?: Maybe<Array<Maybe<ContentfulProject>>>
		/** Returns all children nodes filtered by type contentfulLinkIconTextNode */
		childrenContentfulLinkIconTextNode?: Maybe<
			Array<Maybe<ContentfulLinkIconTextNode>>
		>
		/** Returns the first child node of type contentfulLinkIconTextNode or null if there are no children of given type on this node */
		childContentfulLinkIconTextNode?: Maybe<ContentfulLinkIconTextNode>
		parent?: Maybe<Node>
		children: Array<Node>
		internal: Internal
	}

export type ContentfulLinkCreatedAtArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type ContentfulLinkUpdatedAtArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type ContentfulLinkSys = {
	type?: Maybe<Scalars['String']>
	revision?: Maybe<Scalars['Int']>
	contentType?: Maybe<ContentfulLinkSysContentType>
}

export type ContentfulLinkSysContentType = {
	sys?: Maybe<ContentfulLinkSysContentTypeSys>
}

export type ContentfulLinkSysContentTypeSys = {
	type?: Maybe<Scalars['String']>
	linkType?: Maybe<Scalars['String']>
	id?: Maybe<Scalars['String']>
}

export type ContentfulPage = ContentfulReference &
	ContentfulEntry &
	Node & {
		contentful_id: Scalars['String']
		id: Scalars['ID']
		node_locale: Scalars['String']
		title?: Maybe<Scalars['String']>
		slug?: Maybe<Scalars['String']>
		sections?: Maybe<Array<Maybe<ContentfulParagraphContentfulSectionUnion>>>
		spaceId?: Maybe<Scalars['String']>
		createdAt?: Maybe<Scalars['Date']>
		updatedAt?: Maybe<Scalars['Date']>
		sys?: Maybe<ContentfulPageSys>
		parent?: Maybe<Node>
		children: Array<Node>
		internal: Internal
	}

export type ContentfulPageCreatedAtArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type ContentfulPageUpdatedAtArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type ContentfulParagraphContentfulSectionUnion =
	| ContentfulParagraph
	| ContentfulSection

export type ContentfulPageSys = {
	type?: Maybe<Scalars['String']>
	revision?: Maybe<Scalars['Int']>
	contentType?: Maybe<ContentfulPageSysContentType>
}

export type ContentfulPageSysContentType = {
	sys?: Maybe<ContentfulPageSysContentTypeSys>
}

export type ContentfulPageSysContentTypeSys = {
	type?: Maybe<Scalars['String']>
	linkType?: Maybe<Scalars['String']>
	id?: Maybe<Scalars['String']>
}

export type ContentfulSection = ContentfulReference &
	ContentfulEntry &
	Node & {
		contentful_id: Scalars['String']
		id: Scalars['ID']
		node_locale: Scalars['String']
		title?: Maybe<Scalars['String']>
		blocks?: Maybe<Array<Maybe<ContentfulLinkContentfulProjectUnion>>>
		page?: Maybe<Array<Maybe<ContentfulPage>>>
		spaceId?: Maybe<Scalars['String']>
		createdAt?: Maybe<Scalars['Date']>
		updatedAt?: Maybe<Scalars['Date']>
		sys?: Maybe<ContentfulSectionSys>
		parent?: Maybe<Node>
		children: Array<Node>
		internal: Internal
	}

export type ContentfulSectionCreatedAtArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type ContentfulSectionUpdatedAtArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type ContentfulLinkContentfulProjectUnion =
	| ContentfulLink
	| ContentfulProject

export type ContentfulSectionSys = {
	type?: Maybe<Scalars['String']>
	revision?: Maybe<Scalars['Int']>
	contentType?: Maybe<ContentfulSectionSysContentType>
}

export type ContentfulSectionSysContentType = {
	sys?: Maybe<ContentfulSectionSysContentTypeSys>
}

export type ContentfulSectionSysContentTypeSys = {
	type?: Maybe<Scalars['String']>
	linkType?: Maybe<Scalars['String']>
	id?: Maybe<Scalars['String']>
}

export type ContentfulParagraph = ContentfulReference &
	ContentfulEntry &
	Node & {
		contentful_id: Scalars['String']
		id: Scalars['ID']
		node_locale: Scalars['String']
		identifier?: Maybe<Scalars['String']>
		text?: Maybe<ContentfulParagraphText>
		imageType?: Maybe<Scalars['String']>
		page?: Maybe<Array<Maybe<ContentfulPage>>>
		spaceId?: Maybe<Scalars['String']>
		createdAt?: Maybe<Scalars['Date']>
		updatedAt?: Maybe<Scalars['Date']>
		sys?: Maybe<ContentfulParagraphSys>
		image?: Maybe<ContentfulAsset>
		parent?: Maybe<Node>
		children: Array<Node>
		internal: Internal
	}

export type ContentfulParagraphCreatedAtArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type ContentfulParagraphUpdatedAtArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type ContentfulParagraphText = {
	raw?: Maybe<Scalars['String']>
}

export type ContentfulParagraphSys = {
	type?: Maybe<Scalars['String']>
	revision?: Maybe<Scalars['Int']>
	contentType?: Maybe<ContentfulParagraphSysContentType>
}

export type ContentfulParagraphSysContentType = {
	sys?: Maybe<ContentfulParagraphSysContentTypeSys>
}

export type ContentfulParagraphSysContentTypeSys = {
	type?: Maybe<Scalars['String']>
	linkType?: Maybe<Scalars['String']>
	id?: Maybe<Scalars['String']>
}

export type ContentfulLinkIconTextNode = Node & {
	id: Scalars['ID']
	parent?: Maybe<Node>
	children: Array<Node>
	internal: Internal
	icon?: Maybe<Scalars['String']>
	sys?: Maybe<ContentfulLinkIconTextNodeSys>
}

export type ContentfulLinkIconTextNodeSys = {
	type?: Maybe<Scalars['String']>
}

export type ContentfulContentType = Node & {
	id: Scalars['ID']
	parent?: Maybe<Node>
	children: Array<Node>
	internal: Internal
	name?: Maybe<Scalars['String']>
	displayField?: Maybe<Scalars['String']>
	description?: Maybe<Scalars['String']>
	sys?: Maybe<ContentfulContentTypeSys>
}

export type ContentfulContentTypeSys = {
	type?: Maybe<Scalars['String']>
}

export type SiteBuildMetadata = Node & {
	id: Scalars['ID']
	parent?: Maybe<Node>
	children: Array<Node>
	internal: Internal
	buildTime?: Maybe<Scalars['Date']>
}

export type SiteBuildMetadataBuildTimeArgs = {
	formatString?: Maybe<Scalars['String']>
	fromNow?: Maybe<Scalars['Boolean']>
	difference?: Maybe<Scalars['String']>
	locale?: Maybe<Scalars['String']>
}

export type SitePlugin = Node & {
	id: Scalars['ID']
	parent?: Maybe<Node>
	children: Array<Node>
	internal: Internal
	resolve?: Maybe<Scalars['String']>
	name?: Maybe<Scalars['String']>
	version?: Maybe<Scalars['String']>
	pluginOptions?: Maybe<SitePluginPluginOptions>
	nodeAPIs?: Maybe<Array<Maybe<Scalars['String']>>>
	browserAPIs?: Maybe<Array<Maybe<Scalars['String']>>>
	ssrAPIs?: Maybe<Array<Maybe<Scalars['String']>>>
	pluginFilepath?: Maybe<Scalars['String']>
	packageJson?: Maybe<SitePluginPackageJson>
}

export type SitePluginPluginOptions = {
	output?: Maybe<Scalars['String']>
	createLinkInHead?: Maybe<Scalars['Boolean']>
	name?: Maybe<Scalars['String']>
	short_name?: Maybe<Scalars['String']>
	start_url?: Maybe<Scalars['String']>
	background_color?: Maybe<Scalars['String']>
	theme_color?: Maybe<Scalars['String']>
	display?: Maybe<Scalars['String']>
	icon?: Maybe<Scalars['String']>
	legacy?: Maybe<Scalars['Boolean']>
	theme_color_in_head?: Maybe<Scalars['Boolean']>
	cache_busting_mode?: Maybe<Scalars['String']>
	crossOrigin?: Maybe<Scalars['String']>
	include_favicon?: Maybe<Scalars['Boolean']>
	cacheDigest?: Maybe<Scalars['String']>
	base64Width?: Maybe<Scalars['Int']>
	stripMetadata?: Maybe<Scalars['Boolean']>
	defaultQuality?: Maybe<Scalars['Int']>
	failOnError?: Maybe<Scalars['Boolean']>
	path?: Maybe<Scalars['String']>
	configDir?: Maybe<Scalars['String']>
	pathCheck?: Maybe<Scalars['Boolean']>
	allExtensions?: Maybe<Scalars['Boolean']>
	isTSX?: Maybe<Scalars['Boolean']>
	jsxPragma?: Maybe<Scalars['String']>
	accessToken?: Maybe<Scalars['String']>
	spaceId?: Maybe<Scalars['String']>
	host?: Maybe<Scalars['String']>
	environment?: Maybe<Scalars['String']>
	downloadLocal?: Maybe<Scalars['Boolean']>
	forceFullSync?: Maybe<Scalars['Boolean']>
	pageLimit?: Maybe<Scalars['Int']>
	assetDownloadWorkers?: Maybe<Scalars['Int']>
	useNameForId?: Maybe<Scalars['Boolean']>
}

export type SitePluginPackageJson = {
	name?: Maybe<Scalars['String']>
	description?: Maybe<Scalars['String']>
	version?: Maybe<Scalars['String']>
	main?: Maybe<Scalars['String']>
	author?: Maybe<Scalars['String']>
	license?: Maybe<Scalars['String']>
	dependencies?: Maybe<Array<Maybe<SitePluginPackageJsonDependencies>>>
	devDependencies?: Maybe<Array<Maybe<SitePluginPackageJsonDevDependencies>>>
	peerDependencies?: Maybe<Array<Maybe<SitePluginPackageJsonPeerDependencies>>>
	keywords?: Maybe<Array<Maybe<Scalars['String']>>>
}

export type SitePluginPackageJsonDependencies = {
	name?: Maybe<Scalars['String']>
	version?: Maybe<Scalars['String']>
}

export type SitePluginPackageJsonDevDependencies = {
	name?: Maybe<Scalars['String']>
	version?: Maybe<Scalars['String']>
}

export type SitePluginPackageJsonPeerDependencies = {
	name?: Maybe<Scalars['String']>
	version?: Maybe<Scalars['String']>
}

export type Query = {
	file?: Maybe<File>
	allFile: FileConnection
	directory?: Maybe<Directory>
	allDirectory: DirectoryConnection
	site?: Maybe<Site>
	allSite: SiteConnection
	sitePage?: Maybe<SitePage>
	allSitePage: SitePageConnection
	imageSharp?: Maybe<ImageSharp>
	allImageSharp: ImageSharpConnection
	contentfulEntry?: Maybe<ContentfulEntry>
	allContentfulEntry: ContentfulEntryConnection
	contentfulAsset?: Maybe<ContentfulAsset>
	allContentfulAsset: ContentfulAssetConnection
	contentfulProject?: Maybe<ContentfulProject>
	allContentfulProject: ContentfulProjectConnection
	contentfulBook?: Maybe<ContentfulBook>
	allContentfulBook: ContentfulBookConnection
	contentfulLink?: Maybe<ContentfulLink>
	allContentfulLink: ContentfulLinkConnection
	contentfulPage?: Maybe<ContentfulPage>
	allContentfulPage: ContentfulPageConnection
	contentfulSection?: Maybe<ContentfulSection>
	allContentfulSection: ContentfulSectionConnection
	contentfulParagraph?: Maybe<ContentfulParagraph>
	allContentfulParagraph: ContentfulParagraphConnection
	contentfulLinkIconTextNode?: Maybe<ContentfulLinkIconTextNode>
	allContentfulLinkIconTextNode: ContentfulLinkIconTextNodeConnection
	contentfulContentType?: Maybe<ContentfulContentType>
	allContentfulContentType: ContentfulContentTypeConnection
	siteBuildMetadata?: Maybe<SiteBuildMetadata>
	allSiteBuildMetadata: SiteBuildMetadataConnection
	sitePlugin?: Maybe<SitePlugin>
	allSitePlugin: SitePluginConnection
}

export type QueryFileArgs = {
	sourceInstanceName?: Maybe<StringQueryOperatorInput>
	absolutePath?: Maybe<StringQueryOperatorInput>
	relativePath?: Maybe<StringQueryOperatorInput>
	extension?: Maybe<StringQueryOperatorInput>
	size?: Maybe<IntQueryOperatorInput>
	prettySize?: Maybe<StringQueryOperatorInput>
	modifiedTime?: Maybe<DateQueryOperatorInput>
	accessTime?: Maybe<DateQueryOperatorInput>
	changeTime?: Maybe<DateQueryOperatorInput>
	birthTime?: Maybe<DateQueryOperatorInput>
	root?: Maybe<StringQueryOperatorInput>
	dir?: Maybe<StringQueryOperatorInput>
	base?: Maybe<StringQueryOperatorInput>
	ext?: Maybe<StringQueryOperatorInput>
	name?: Maybe<StringQueryOperatorInput>
	relativeDirectory?: Maybe<StringQueryOperatorInput>
	dev?: Maybe<IntQueryOperatorInput>
	mode?: Maybe<IntQueryOperatorInput>
	nlink?: Maybe<IntQueryOperatorInput>
	uid?: Maybe<IntQueryOperatorInput>
	gid?: Maybe<IntQueryOperatorInput>
	rdev?: Maybe<IntQueryOperatorInput>
	ino?: Maybe<FloatQueryOperatorInput>
	atimeMs?: Maybe<FloatQueryOperatorInput>
	mtimeMs?: Maybe<FloatQueryOperatorInput>
	ctimeMs?: Maybe<FloatQueryOperatorInput>
	atime?: Maybe<DateQueryOperatorInput>
	mtime?: Maybe<DateQueryOperatorInput>
	ctime?: Maybe<DateQueryOperatorInput>
	birthtime?: Maybe<DateQueryOperatorInput>
	birthtimeMs?: Maybe<FloatQueryOperatorInput>
	blksize?: Maybe<IntQueryOperatorInput>
	blocks?: Maybe<IntQueryOperatorInput>
	publicURL?: Maybe<StringQueryOperatorInput>
	childrenImageSharp?: Maybe<ImageSharpFilterListInput>
	childImageSharp?: Maybe<ImageSharpFilterInput>
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type QueryAllFileArgs = {
	filter?: Maybe<FileFilterInput>
	sort?: Maybe<FileSortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type QueryDirectoryArgs = {
	sourceInstanceName?: Maybe<StringQueryOperatorInput>
	absolutePath?: Maybe<StringQueryOperatorInput>
	relativePath?: Maybe<StringQueryOperatorInput>
	extension?: Maybe<StringQueryOperatorInput>
	size?: Maybe<IntQueryOperatorInput>
	prettySize?: Maybe<StringQueryOperatorInput>
	modifiedTime?: Maybe<DateQueryOperatorInput>
	accessTime?: Maybe<DateQueryOperatorInput>
	changeTime?: Maybe<DateQueryOperatorInput>
	birthTime?: Maybe<DateQueryOperatorInput>
	root?: Maybe<StringQueryOperatorInput>
	dir?: Maybe<StringQueryOperatorInput>
	base?: Maybe<StringQueryOperatorInput>
	ext?: Maybe<StringQueryOperatorInput>
	name?: Maybe<StringQueryOperatorInput>
	relativeDirectory?: Maybe<StringQueryOperatorInput>
	dev?: Maybe<IntQueryOperatorInput>
	mode?: Maybe<IntQueryOperatorInput>
	nlink?: Maybe<IntQueryOperatorInput>
	uid?: Maybe<IntQueryOperatorInput>
	gid?: Maybe<IntQueryOperatorInput>
	rdev?: Maybe<IntQueryOperatorInput>
	ino?: Maybe<FloatQueryOperatorInput>
	atimeMs?: Maybe<FloatQueryOperatorInput>
	mtimeMs?: Maybe<FloatQueryOperatorInput>
	ctimeMs?: Maybe<FloatQueryOperatorInput>
	atime?: Maybe<DateQueryOperatorInput>
	mtime?: Maybe<DateQueryOperatorInput>
	ctime?: Maybe<DateQueryOperatorInput>
	birthtime?: Maybe<DateQueryOperatorInput>
	birthtimeMs?: Maybe<FloatQueryOperatorInput>
	blksize?: Maybe<IntQueryOperatorInput>
	blocks?: Maybe<IntQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type QueryAllDirectoryArgs = {
	filter?: Maybe<DirectoryFilterInput>
	sort?: Maybe<DirectorySortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type QuerySiteArgs = {
	buildTime?: Maybe<DateQueryOperatorInput>
	siteMetadata?: Maybe<SiteSiteMetadataFilterInput>
	port?: Maybe<IntQueryOperatorInput>
	host?: Maybe<StringQueryOperatorInput>
	polyfill?: Maybe<BooleanQueryOperatorInput>
	pathPrefix?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type QueryAllSiteArgs = {
	filter?: Maybe<SiteFilterInput>
	sort?: Maybe<SiteSortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type QuerySitePageArgs = {
	path?: Maybe<StringQueryOperatorInput>
	component?: Maybe<StringQueryOperatorInput>
	internalComponentName?: Maybe<StringQueryOperatorInput>
	componentChunkName?: Maybe<StringQueryOperatorInput>
	matchPath?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
	isCreatedByStatefulCreatePages?: Maybe<BooleanQueryOperatorInput>
	context?: Maybe<SitePageContextFilterInput>
	pluginCreator?: Maybe<SitePluginFilterInput>
	pluginCreatorId?: Maybe<StringQueryOperatorInput>
	componentPath?: Maybe<StringQueryOperatorInput>
}

export type QueryAllSitePageArgs = {
	filter?: Maybe<SitePageFilterInput>
	sort?: Maybe<SitePageSortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type QueryImageSharpArgs = {
	fixed?: Maybe<ImageSharpFixedFilterInput>
	fluid?: Maybe<ImageSharpFluidFilterInput>
	gatsbyImageData?: Maybe<JsonQueryOperatorInput>
	original?: Maybe<ImageSharpOriginalFilterInput>
	resize?: Maybe<ImageSharpResizeFilterInput>
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type QueryAllImageSharpArgs = {
	filter?: Maybe<ImageSharpFilterInput>
	sort?: Maybe<ImageSharpSortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type QueryContentfulEntryArgs = {
	contentful_id?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	node_locale?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type QueryAllContentfulEntryArgs = {
	filter?: Maybe<ContentfulEntryFilterInput>
	sort?: Maybe<ContentfulEntrySortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type QueryContentfulAssetArgs = {
	contentful_id?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	spaceId?: Maybe<StringQueryOperatorInput>
	createdAt?: Maybe<DateQueryOperatorInput>
	updatedAt?: Maybe<DateQueryOperatorInput>
	file?: Maybe<ContentfulAssetFileFilterInput>
	title?: Maybe<StringQueryOperatorInput>
	description?: Maybe<StringQueryOperatorInput>
	node_locale?: Maybe<StringQueryOperatorInput>
	sys?: Maybe<ContentfulAssetSysFilterInput>
	fixed?: Maybe<ContentfulFixedFilterInput>
	fluid?: Maybe<ContentfulFluidFilterInput>
	gatsbyImageData?: Maybe<JsonQueryOperatorInput>
	resize?: Maybe<ContentfulResizeFilterInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type QueryAllContentfulAssetArgs = {
	filter?: Maybe<ContentfulAssetFilterInput>
	sort?: Maybe<ContentfulAssetSortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type QueryContentfulProjectArgs = {
	contentful_id?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	node_locale?: Maybe<StringQueryOperatorInput>
	title?: Maybe<StringQueryOperatorInput>
	creationDate?: Maybe<DateQueryOperatorInput>
	type?: Maybe<StringQueryOperatorInput>
	description?: Maybe<ContentfulProjectDescriptionFilterInput>
	link?: Maybe<ContentfulLinkFilterInput>
	thumbnail?: Maybe<ContentfulAssetFilterInput>
	section?: Maybe<ContentfulSectionFilterListInput>
	spaceId?: Maybe<StringQueryOperatorInput>
	createdAt?: Maybe<DateQueryOperatorInput>
	updatedAt?: Maybe<DateQueryOperatorInput>
	sys?: Maybe<ContentfulProjectSysFilterInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type QueryAllContentfulProjectArgs = {
	filter?: Maybe<ContentfulProjectFilterInput>
	sort?: Maybe<ContentfulProjectSortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type QueryContentfulBookArgs = {
	contentful_id?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	node_locale?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type QueryAllContentfulBookArgs = {
	filter?: Maybe<ContentfulBookFilterInput>
	sort?: Maybe<ContentfulBookSortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type QueryContentfulLinkArgs = {
	contentful_id?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	node_locale?: Maybe<StringQueryOperatorInput>
	title?: Maybe<StringQueryOperatorInput>
	url?: Maybe<StringQueryOperatorInput>
	section?: Maybe<ContentfulSectionFilterListInput>
	icon?: Maybe<ContentfulLinkIconTextNodeFilterInput>
	spaceId?: Maybe<StringQueryOperatorInput>
	createdAt?: Maybe<DateQueryOperatorInput>
	updatedAt?: Maybe<DateQueryOperatorInput>
	sys?: Maybe<ContentfulLinkSysFilterInput>
	project?: Maybe<ContentfulProjectFilterListInput>
	childrenContentfulLinkIconTextNode?: Maybe<ContentfulLinkIconTextNodeFilterListInput>
	childContentfulLinkIconTextNode?: Maybe<ContentfulLinkIconTextNodeFilterInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type QueryAllContentfulLinkArgs = {
	filter?: Maybe<ContentfulLinkFilterInput>
	sort?: Maybe<ContentfulLinkSortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type QueryContentfulPageArgs = {
	contentful_id?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	node_locale?: Maybe<StringQueryOperatorInput>
	title?: Maybe<StringQueryOperatorInput>
	slug?: Maybe<StringQueryOperatorInput>
	spaceId?: Maybe<StringQueryOperatorInput>
	createdAt?: Maybe<DateQueryOperatorInput>
	updatedAt?: Maybe<DateQueryOperatorInput>
	sys?: Maybe<ContentfulPageSysFilterInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type QueryAllContentfulPageArgs = {
	filter?: Maybe<ContentfulPageFilterInput>
	sort?: Maybe<ContentfulPageSortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type QueryContentfulSectionArgs = {
	contentful_id?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	node_locale?: Maybe<StringQueryOperatorInput>
	title?: Maybe<StringQueryOperatorInput>
	page?: Maybe<ContentfulPageFilterListInput>
	spaceId?: Maybe<StringQueryOperatorInput>
	createdAt?: Maybe<DateQueryOperatorInput>
	updatedAt?: Maybe<DateQueryOperatorInput>
	sys?: Maybe<ContentfulSectionSysFilterInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type QueryAllContentfulSectionArgs = {
	filter?: Maybe<ContentfulSectionFilterInput>
	sort?: Maybe<ContentfulSectionSortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type QueryContentfulParagraphArgs = {
	contentful_id?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	node_locale?: Maybe<StringQueryOperatorInput>
	identifier?: Maybe<StringQueryOperatorInput>
	text?: Maybe<ContentfulParagraphTextFilterInput>
	imageType?: Maybe<StringQueryOperatorInput>
	page?: Maybe<ContentfulPageFilterListInput>
	spaceId?: Maybe<StringQueryOperatorInput>
	createdAt?: Maybe<DateQueryOperatorInput>
	updatedAt?: Maybe<DateQueryOperatorInput>
	sys?: Maybe<ContentfulParagraphSysFilterInput>
	image?: Maybe<ContentfulAssetFilterInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type QueryAllContentfulParagraphArgs = {
	filter?: Maybe<ContentfulParagraphFilterInput>
	sort?: Maybe<ContentfulParagraphSortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type QueryContentfulLinkIconTextNodeArgs = {
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
	icon?: Maybe<StringQueryOperatorInput>
	sys?: Maybe<ContentfulLinkIconTextNodeSysFilterInput>
}

export type QueryAllContentfulLinkIconTextNodeArgs = {
	filter?: Maybe<ContentfulLinkIconTextNodeFilterInput>
	sort?: Maybe<ContentfulLinkIconTextNodeSortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type QueryContentfulContentTypeArgs = {
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
	name?: Maybe<StringQueryOperatorInput>
	displayField?: Maybe<StringQueryOperatorInput>
	description?: Maybe<StringQueryOperatorInput>
	sys?: Maybe<ContentfulContentTypeSysFilterInput>
}

export type QueryAllContentfulContentTypeArgs = {
	filter?: Maybe<ContentfulContentTypeFilterInput>
	sort?: Maybe<ContentfulContentTypeSortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type QuerySiteBuildMetadataArgs = {
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
	buildTime?: Maybe<DateQueryOperatorInput>
}

export type QueryAllSiteBuildMetadataArgs = {
	filter?: Maybe<SiteBuildMetadataFilterInput>
	sort?: Maybe<SiteBuildMetadataSortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type QuerySitePluginArgs = {
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
	resolve?: Maybe<StringQueryOperatorInput>
	name?: Maybe<StringQueryOperatorInput>
	version?: Maybe<StringQueryOperatorInput>
	pluginOptions?: Maybe<SitePluginPluginOptionsFilterInput>
	nodeAPIs?: Maybe<StringQueryOperatorInput>
	browserAPIs?: Maybe<StringQueryOperatorInput>
	ssrAPIs?: Maybe<StringQueryOperatorInput>
	pluginFilepath?: Maybe<StringQueryOperatorInput>
	packageJson?: Maybe<SitePluginPackageJsonFilterInput>
}

export type QueryAllSitePluginArgs = {
	filter?: Maybe<SitePluginFilterInput>
	sort?: Maybe<SitePluginSortInput>
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
}

export type StringQueryOperatorInput = {
	eq?: Maybe<Scalars['String']>
	ne?: Maybe<Scalars['String']>
	in?: Maybe<Array<Maybe<Scalars['String']>>>
	nin?: Maybe<Array<Maybe<Scalars['String']>>>
	regex?: Maybe<Scalars['String']>
	glob?: Maybe<Scalars['String']>
}

export type IntQueryOperatorInput = {
	eq?: Maybe<Scalars['Int']>
	ne?: Maybe<Scalars['Int']>
	gt?: Maybe<Scalars['Int']>
	gte?: Maybe<Scalars['Int']>
	lt?: Maybe<Scalars['Int']>
	lte?: Maybe<Scalars['Int']>
	in?: Maybe<Array<Maybe<Scalars['Int']>>>
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>
}

export type DateQueryOperatorInput = {
	eq?: Maybe<Scalars['Date']>
	ne?: Maybe<Scalars['Date']>
	gt?: Maybe<Scalars['Date']>
	gte?: Maybe<Scalars['Date']>
	lt?: Maybe<Scalars['Date']>
	lte?: Maybe<Scalars['Date']>
	in?: Maybe<Array<Maybe<Scalars['Date']>>>
	nin?: Maybe<Array<Maybe<Scalars['Date']>>>
}

export type FloatQueryOperatorInput = {
	eq?: Maybe<Scalars['Float']>
	ne?: Maybe<Scalars['Float']>
	gt?: Maybe<Scalars['Float']>
	gte?: Maybe<Scalars['Float']>
	lt?: Maybe<Scalars['Float']>
	lte?: Maybe<Scalars['Float']>
	in?: Maybe<Array<Maybe<Scalars['Float']>>>
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>
}

export type ImageSharpFilterListInput = {
	elemMatch?: Maybe<ImageSharpFilterInput>
}

export type ImageSharpFilterInput = {
	fixed?: Maybe<ImageSharpFixedFilterInput>
	fluid?: Maybe<ImageSharpFluidFilterInput>
	gatsbyImageData?: Maybe<JsonQueryOperatorInput>
	original?: Maybe<ImageSharpOriginalFilterInput>
	resize?: Maybe<ImageSharpResizeFilterInput>
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type ImageSharpFixedFilterInput = {
	base64?: Maybe<StringQueryOperatorInput>
	tracedSVG?: Maybe<StringQueryOperatorInput>
	aspectRatio?: Maybe<FloatQueryOperatorInput>
	width?: Maybe<FloatQueryOperatorInput>
	height?: Maybe<FloatQueryOperatorInput>
	src?: Maybe<StringQueryOperatorInput>
	srcSet?: Maybe<StringQueryOperatorInput>
	srcWebp?: Maybe<StringQueryOperatorInput>
	srcSetWebp?: Maybe<StringQueryOperatorInput>
	originalName?: Maybe<StringQueryOperatorInput>
}

export type ImageSharpFluidFilterInput = {
	base64?: Maybe<StringQueryOperatorInput>
	tracedSVG?: Maybe<StringQueryOperatorInput>
	aspectRatio?: Maybe<FloatQueryOperatorInput>
	src?: Maybe<StringQueryOperatorInput>
	srcSet?: Maybe<StringQueryOperatorInput>
	srcWebp?: Maybe<StringQueryOperatorInput>
	srcSetWebp?: Maybe<StringQueryOperatorInput>
	sizes?: Maybe<StringQueryOperatorInput>
	originalImg?: Maybe<StringQueryOperatorInput>
	originalName?: Maybe<StringQueryOperatorInput>
	presentationWidth?: Maybe<IntQueryOperatorInput>
	presentationHeight?: Maybe<IntQueryOperatorInput>
}

export type JsonQueryOperatorInput = {
	eq?: Maybe<Scalars['JSON']>
	ne?: Maybe<Scalars['JSON']>
	in?: Maybe<Array<Maybe<Scalars['JSON']>>>
	nin?: Maybe<Array<Maybe<Scalars['JSON']>>>
	regex?: Maybe<Scalars['JSON']>
	glob?: Maybe<Scalars['JSON']>
}

export type ImageSharpOriginalFilterInput = {
	width?: Maybe<FloatQueryOperatorInput>
	height?: Maybe<FloatQueryOperatorInput>
	src?: Maybe<StringQueryOperatorInput>
}

export type ImageSharpResizeFilterInput = {
	src?: Maybe<StringQueryOperatorInput>
	tracedSVG?: Maybe<StringQueryOperatorInput>
	width?: Maybe<IntQueryOperatorInput>
	height?: Maybe<IntQueryOperatorInput>
	aspectRatio?: Maybe<FloatQueryOperatorInput>
	originalName?: Maybe<StringQueryOperatorInput>
}

export type NodeFilterInput = {
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type NodeFilterListInput = {
	elemMatch?: Maybe<NodeFilterInput>
}

export type InternalFilterInput = {
	content?: Maybe<StringQueryOperatorInput>
	contentDigest?: Maybe<StringQueryOperatorInput>
	description?: Maybe<StringQueryOperatorInput>
	fieldOwners?: Maybe<StringQueryOperatorInput>
	ignoreType?: Maybe<BooleanQueryOperatorInput>
	mediaType?: Maybe<StringQueryOperatorInput>
	owner?: Maybe<StringQueryOperatorInput>
	type?: Maybe<StringQueryOperatorInput>
}

export type BooleanQueryOperatorInput = {
	eq?: Maybe<Scalars['Boolean']>
	ne?: Maybe<Scalars['Boolean']>
	in?: Maybe<Array<Maybe<Scalars['Boolean']>>>
	nin?: Maybe<Array<Maybe<Scalars['Boolean']>>>
}

export type FileConnection = {
	totalCount: Scalars['Int']
	edges: Array<FileEdge>
	nodes: Array<File>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<FileGroupConnection>
}

export type FileConnectionDistinctArgs = {
	field: FileFieldsEnum
}

export type FileConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: FileFieldsEnum
}

export type FileEdge = {
	next?: Maybe<File>
	node: File
	previous?: Maybe<File>
}

export type PageInfo = {
	currentPage: Scalars['Int']
	hasPreviousPage: Scalars['Boolean']
	hasNextPage: Scalars['Boolean']
	itemCount: Scalars['Int']
	pageCount: Scalars['Int']
	perPage?: Maybe<Scalars['Int']>
	totalCount: Scalars['Int']
}

export type FileFieldsEnum =
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
	| 'childrenImageSharp___fixed___base64'
	| 'childrenImageSharp___fixed___tracedSVG'
	| 'childrenImageSharp___fixed___aspectRatio'
	| 'childrenImageSharp___fixed___width'
	| 'childrenImageSharp___fixed___height'
	| 'childrenImageSharp___fixed___src'
	| 'childrenImageSharp___fixed___srcSet'
	| 'childrenImageSharp___fixed___srcWebp'
	| 'childrenImageSharp___fixed___srcSetWebp'
	| 'childrenImageSharp___fixed___originalName'
	| 'childrenImageSharp___fluid___base64'
	| 'childrenImageSharp___fluid___tracedSVG'
	| 'childrenImageSharp___fluid___aspectRatio'
	| 'childrenImageSharp___fluid___src'
	| 'childrenImageSharp___fluid___srcSet'
	| 'childrenImageSharp___fluid___srcWebp'
	| 'childrenImageSharp___fluid___srcSetWebp'
	| 'childrenImageSharp___fluid___sizes'
	| 'childrenImageSharp___fluid___originalImg'
	| 'childrenImageSharp___fluid___originalName'
	| 'childrenImageSharp___fluid___presentationWidth'
	| 'childrenImageSharp___fluid___presentationHeight'
	| 'childrenImageSharp___gatsbyImageData'
	| 'childrenImageSharp___original___width'
	| 'childrenImageSharp___original___height'
	| 'childrenImageSharp___original___src'
	| 'childrenImageSharp___resize___src'
	| 'childrenImageSharp___resize___tracedSVG'
	| 'childrenImageSharp___resize___width'
	| 'childrenImageSharp___resize___height'
	| 'childrenImageSharp___resize___aspectRatio'
	| 'childrenImageSharp___resize___originalName'
	| 'childrenImageSharp___id'
	| 'childrenImageSharp___parent___id'
	| 'childrenImageSharp___parent___parent___id'
	| 'childrenImageSharp___parent___parent___children'
	| 'childrenImageSharp___parent___children'
	| 'childrenImageSharp___parent___children___id'
	| 'childrenImageSharp___parent___children___children'
	| 'childrenImageSharp___parent___internal___content'
	| 'childrenImageSharp___parent___internal___contentDigest'
	| 'childrenImageSharp___parent___internal___description'
	| 'childrenImageSharp___parent___internal___fieldOwners'
	| 'childrenImageSharp___parent___internal___ignoreType'
	| 'childrenImageSharp___parent___internal___mediaType'
	| 'childrenImageSharp___parent___internal___owner'
	| 'childrenImageSharp___parent___internal___type'
	| 'childrenImageSharp___children'
	| 'childrenImageSharp___children___id'
	| 'childrenImageSharp___children___parent___id'
	| 'childrenImageSharp___children___parent___children'
	| 'childrenImageSharp___children___children'
	| 'childrenImageSharp___children___children___id'
	| 'childrenImageSharp___children___children___children'
	| 'childrenImageSharp___children___internal___content'
	| 'childrenImageSharp___children___internal___contentDigest'
	| 'childrenImageSharp___children___internal___description'
	| 'childrenImageSharp___children___internal___fieldOwners'
	| 'childrenImageSharp___children___internal___ignoreType'
	| 'childrenImageSharp___children___internal___mediaType'
	| 'childrenImageSharp___children___internal___owner'
	| 'childrenImageSharp___children___internal___type'
	| 'childrenImageSharp___internal___content'
	| 'childrenImageSharp___internal___contentDigest'
	| 'childrenImageSharp___internal___description'
	| 'childrenImageSharp___internal___fieldOwners'
	| 'childrenImageSharp___internal___ignoreType'
	| 'childrenImageSharp___internal___mediaType'
	| 'childrenImageSharp___internal___owner'
	| 'childrenImageSharp___internal___type'
	| 'childImageSharp___fixed___base64'
	| 'childImageSharp___fixed___tracedSVG'
	| 'childImageSharp___fixed___aspectRatio'
	| 'childImageSharp___fixed___width'
	| 'childImageSharp___fixed___height'
	| 'childImageSharp___fixed___src'
	| 'childImageSharp___fixed___srcSet'
	| 'childImageSharp___fixed___srcWebp'
	| 'childImageSharp___fixed___srcSetWebp'
	| 'childImageSharp___fixed___originalName'
	| 'childImageSharp___fluid___base64'
	| 'childImageSharp___fluid___tracedSVG'
	| 'childImageSharp___fluid___aspectRatio'
	| 'childImageSharp___fluid___src'
	| 'childImageSharp___fluid___srcSet'
	| 'childImageSharp___fluid___srcWebp'
	| 'childImageSharp___fluid___srcSetWebp'
	| 'childImageSharp___fluid___sizes'
	| 'childImageSharp___fluid___originalImg'
	| 'childImageSharp___fluid___originalName'
	| 'childImageSharp___fluid___presentationWidth'
	| 'childImageSharp___fluid___presentationHeight'
	| 'childImageSharp___gatsbyImageData'
	| 'childImageSharp___original___width'
	| 'childImageSharp___original___height'
	| 'childImageSharp___original___src'
	| 'childImageSharp___resize___src'
	| 'childImageSharp___resize___tracedSVG'
	| 'childImageSharp___resize___width'
	| 'childImageSharp___resize___height'
	| 'childImageSharp___resize___aspectRatio'
	| 'childImageSharp___resize___originalName'
	| 'childImageSharp___id'
	| 'childImageSharp___parent___id'
	| 'childImageSharp___parent___parent___id'
	| 'childImageSharp___parent___parent___children'
	| 'childImageSharp___parent___children'
	| 'childImageSharp___parent___children___id'
	| 'childImageSharp___parent___children___children'
	| 'childImageSharp___parent___internal___content'
	| 'childImageSharp___parent___internal___contentDigest'
	| 'childImageSharp___parent___internal___description'
	| 'childImageSharp___parent___internal___fieldOwners'
	| 'childImageSharp___parent___internal___ignoreType'
	| 'childImageSharp___parent___internal___mediaType'
	| 'childImageSharp___parent___internal___owner'
	| 'childImageSharp___parent___internal___type'
	| 'childImageSharp___children'
	| 'childImageSharp___children___id'
	| 'childImageSharp___children___parent___id'
	| 'childImageSharp___children___parent___children'
	| 'childImageSharp___children___children'
	| 'childImageSharp___children___children___id'
	| 'childImageSharp___children___children___children'
	| 'childImageSharp___children___internal___content'
	| 'childImageSharp___children___internal___contentDigest'
	| 'childImageSharp___children___internal___description'
	| 'childImageSharp___children___internal___fieldOwners'
	| 'childImageSharp___children___internal___ignoreType'
	| 'childImageSharp___children___internal___mediaType'
	| 'childImageSharp___children___internal___owner'
	| 'childImageSharp___children___internal___type'
	| 'childImageSharp___internal___content'
	| 'childImageSharp___internal___contentDigest'
	| 'childImageSharp___internal___description'
	| 'childImageSharp___internal___fieldOwners'
	| 'childImageSharp___internal___ignoreType'
	| 'childImageSharp___internal___mediaType'
	| 'childImageSharp___internal___owner'
	| 'childImageSharp___internal___type'
	| 'id'
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'

export type FileGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<FileEdge>
	nodes: Array<File>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type FileFilterInput = {
	sourceInstanceName?: Maybe<StringQueryOperatorInput>
	absolutePath?: Maybe<StringQueryOperatorInput>
	relativePath?: Maybe<StringQueryOperatorInput>
	extension?: Maybe<StringQueryOperatorInput>
	size?: Maybe<IntQueryOperatorInput>
	prettySize?: Maybe<StringQueryOperatorInput>
	modifiedTime?: Maybe<DateQueryOperatorInput>
	accessTime?: Maybe<DateQueryOperatorInput>
	changeTime?: Maybe<DateQueryOperatorInput>
	birthTime?: Maybe<DateQueryOperatorInput>
	root?: Maybe<StringQueryOperatorInput>
	dir?: Maybe<StringQueryOperatorInput>
	base?: Maybe<StringQueryOperatorInput>
	ext?: Maybe<StringQueryOperatorInput>
	name?: Maybe<StringQueryOperatorInput>
	relativeDirectory?: Maybe<StringQueryOperatorInput>
	dev?: Maybe<IntQueryOperatorInput>
	mode?: Maybe<IntQueryOperatorInput>
	nlink?: Maybe<IntQueryOperatorInput>
	uid?: Maybe<IntQueryOperatorInput>
	gid?: Maybe<IntQueryOperatorInput>
	rdev?: Maybe<IntQueryOperatorInput>
	ino?: Maybe<FloatQueryOperatorInput>
	atimeMs?: Maybe<FloatQueryOperatorInput>
	mtimeMs?: Maybe<FloatQueryOperatorInput>
	ctimeMs?: Maybe<FloatQueryOperatorInput>
	atime?: Maybe<DateQueryOperatorInput>
	mtime?: Maybe<DateQueryOperatorInput>
	ctime?: Maybe<DateQueryOperatorInput>
	birthtime?: Maybe<DateQueryOperatorInput>
	birthtimeMs?: Maybe<FloatQueryOperatorInput>
	blksize?: Maybe<IntQueryOperatorInput>
	blocks?: Maybe<IntQueryOperatorInput>
	publicURL?: Maybe<StringQueryOperatorInput>
	childrenImageSharp?: Maybe<ImageSharpFilterListInput>
	childImageSharp?: Maybe<ImageSharpFilterInput>
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type FileSortInput = {
	fields?: Maybe<Array<Maybe<FileFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type SortOrderEnum = 'ASC' | 'DESC'

export type DirectoryConnection = {
	totalCount: Scalars['Int']
	edges: Array<DirectoryEdge>
	nodes: Array<Directory>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<DirectoryGroupConnection>
}

export type DirectoryConnectionDistinctArgs = {
	field: DirectoryFieldsEnum
}

export type DirectoryConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: DirectoryFieldsEnum
}

export type DirectoryEdge = {
	next?: Maybe<Directory>
	node: Directory
	previous?: Maybe<Directory>
}

export type DirectoryFieldsEnum =
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
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'

export type DirectoryGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<DirectoryEdge>
	nodes: Array<Directory>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type DirectoryFilterInput = {
	sourceInstanceName?: Maybe<StringQueryOperatorInput>
	absolutePath?: Maybe<StringQueryOperatorInput>
	relativePath?: Maybe<StringQueryOperatorInput>
	extension?: Maybe<StringQueryOperatorInput>
	size?: Maybe<IntQueryOperatorInput>
	prettySize?: Maybe<StringQueryOperatorInput>
	modifiedTime?: Maybe<DateQueryOperatorInput>
	accessTime?: Maybe<DateQueryOperatorInput>
	changeTime?: Maybe<DateQueryOperatorInput>
	birthTime?: Maybe<DateQueryOperatorInput>
	root?: Maybe<StringQueryOperatorInput>
	dir?: Maybe<StringQueryOperatorInput>
	base?: Maybe<StringQueryOperatorInput>
	ext?: Maybe<StringQueryOperatorInput>
	name?: Maybe<StringQueryOperatorInput>
	relativeDirectory?: Maybe<StringQueryOperatorInput>
	dev?: Maybe<IntQueryOperatorInput>
	mode?: Maybe<IntQueryOperatorInput>
	nlink?: Maybe<IntQueryOperatorInput>
	uid?: Maybe<IntQueryOperatorInput>
	gid?: Maybe<IntQueryOperatorInput>
	rdev?: Maybe<IntQueryOperatorInput>
	ino?: Maybe<FloatQueryOperatorInput>
	atimeMs?: Maybe<FloatQueryOperatorInput>
	mtimeMs?: Maybe<FloatQueryOperatorInput>
	ctimeMs?: Maybe<FloatQueryOperatorInput>
	atime?: Maybe<DateQueryOperatorInput>
	mtime?: Maybe<DateQueryOperatorInput>
	ctime?: Maybe<DateQueryOperatorInput>
	birthtime?: Maybe<DateQueryOperatorInput>
	birthtimeMs?: Maybe<FloatQueryOperatorInput>
	blksize?: Maybe<IntQueryOperatorInput>
	blocks?: Maybe<IntQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type DirectorySortInput = {
	fields?: Maybe<Array<Maybe<DirectoryFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type SiteSiteMetadataFilterInput = {
	title?: Maybe<StringQueryOperatorInput>
	description?: Maybe<StringQueryOperatorInput>
	author?: Maybe<StringQueryOperatorInput>
	siteUrl?: Maybe<StringQueryOperatorInput>
}

export type SiteConnection = {
	totalCount: Scalars['Int']
	edges: Array<SiteEdge>
	nodes: Array<Site>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<SiteGroupConnection>
}

export type SiteConnectionDistinctArgs = {
	field: SiteFieldsEnum
}

export type SiteConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: SiteFieldsEnum
}

export type SiteEdge = {
	next?: Maybe<Site>
	node: Site
	previous?: Maybe<Site>
}

export type SiteFieldsEnum =
	| 'buildTime'
	| 'siteMetadata___title'
	| 'siteMetadata___description'
	| 'siteMetadata___author'
	| 'siteMetadata___siteUrl'
	| 'port'
	| 'host'
	| 'polyfill'
	| 'pathPrefix'
	| 'id'
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'

export type SiteGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<SiteEdge>
	nodes: Array<Site>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type SiteFilterInput = {
	buildTime?: Maybe<DateQueryOperatorInput>
	siteMetadata?: Maybe<SiteSiteMetadataFilterInput>
	port?: Maybe<IntQueryOperatorInput>
	host?: Maybe<StringQueryOperatorInput>
	polyfill?: Maybe<BooleanQueryOperatorInput>
	pathPrefix?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type SiteSortInput = {
	fields?: Maybe<Array<Maybe<SiteFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type SitePageContextFilterInput = {
	id?: Maybe<StringQueryOperatorInput>
}

export type SitePluginFilterInput = {
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
	resolve?: Maybe<StringQueryOperatorInput>
	name?: Maybe<StringQueryOperatorInput>
	version?: Maybe<StringQueryOperatorInput>
	pluginOptions?: Maybe<SitePluginPluginOptionsFilterInput>
	nodeAPIs?: Maybe<StringQueryOperatorInput>
	browserAPIs?: Maybe<StringQueryOperatorInput>
	ssrAPIs?: Maybe<StringQueryOperatorInput>
	pluginFilepath?: Maybe<StringQueryOperatorInput>
	packageJson?: Maybe<SitePluginPackageJsonFilterInput>
}

export type SitePluginPluginOptionsFilterInput = {
	output?: Maybe<StringQueryOperatorInput>
	createLinkInHead?: Maybe<BooleanQueryOperatorInput>
	name?: Maybe<StringQueryOperatorInput>
	short_name?: Maybe<StringQueryOperatorInput>
	start_url?: Maybe<StringQueryOperatorInput>
	background_color?: Maybe<StringQueryOperatorInput>
	theme_color?: Maybe<StringQueryOperatorInput>
	display?: Maybe<StringQueryOperatorInput>
	icon?: Maybe<StringQueryOperatorInput>
	legacy?: Maybe<BooleanQueryOperatorInput>
	theme_color_in_head?: Maybe<BooleanQueryOperatorInput>
	cache_busting_mode?: Maybe<StringQueryOperatorInput>
	crossOrigin?: Maybe<StringQueryOperatorInput>
	include_favicon?: Maybe<BooleanQueryOperatorInput>
	cacheDigest?: Maybe<StringQueryOperatorInput>
	base64Width?: Maybe<IntQueryOperatorInput>
	stripMetadata?: Maybe<BooleanQueryOperatorInput>
	defaultQuality?: Maybe<IntQueryOperatorInput>
	failOnError?: Maybe<BooleanQueryOperatorInput>
	path?: Maybe<StringQueryOperatorInput>
	configDir?: Maybe<StringQueryOperatorInput>
	pathCheck?: Maybe<BooleanQueryOperatorInput>
	allExtensions?: Maybe<BooleanQueryOperatorInput>
	isTSX?: Maybe<BooleanQueryOperatorInput>
	jsxPragma?: Maybe<StringQueryOperatorInput>
	accessToken?: Maybe<StringQueryOperatorInput>
	spaceId?: Maybe<StringQueryOperatorInput>
	host?: Maybe<StringQueryOperatorInput>
	environment?: Maybe<StringQueryOperatorInput>
	downloadLocal?: Maybe<BooleanQueryOperatorInput>
	forceFullSync?: Maybe<BooleanQueryOperatorInput>
	pageLimit?: Maybe<IntQueryOperatorInput>
	assetDownloadWorkers?: Maybe<IntQueryOperatorInput>
	useNameForId?: Maybe<BooleanQueryOperatorInput>
}

export type SitePluginPackageJsonFilterInput = {
	name?: Maybe<StringQueryOperatorInput>
	description?: Maybe<StringQueryOperatorInput>
	version?: Maybe<StringQueryOperatorInput>
	main?: Maybe<StringQueryOperatorInput>
	author?: Maybe<StringQueryOperatorInput>
	license?: Maybe<StringQueryOperatorInput>
	dependencies?: Maybe<SitePluginPackageJsonDependenciesFilterListInput>
	devDependencies?: Maybe<SitePluginPackageJsonDevDependenciesFilterListInput>
	peerDependencies?: Maybe<SitePluginPackageJsonPeerDependenciesFilterListInput>
	keywords?: Maybe<StringQueryOperatorInput>
}

export type SitePluginPackageJsonDependenciesFilterListInput = {
	elemMatch?: Maybe<SitePluginPackageJsonDependenciesFilterInput>
}

export type SitePluginPackageJsonDependenciesFilterInput = {
	name?: Maybe<StringQueryOperatorInput>
	version?: Maybe<StringQueryOperatorInput>
}

export type SitePluginPackageJsonDevDependenciesFilterListInput = {
	elemMatch?: Maybe<SitePluginPackageJsonDevDependenciesFilterInput>
}

export type SitePluginPackageJsonDevDependenciesFilterInput = {
	name?: Maybe<StringQueryOperatorInput>
	version?: Maybe<StringQueryOperatorInput>
}

export type SitePluginPackageJsonPeerDependenciesFilterListInput = {
	elemMatch?: Maybe<SitePluginPackageJsonPeerDependenciesFilterInput>
}

export type SitePluginPackageJsonPeerDependenciesFilterInput = {
	name?: Maybe<StringQueryOperatorInput>
	version?: Maybe<StringQueryOperatorInput>
}

export type SitePageConnection = {
	totalCount: Scalars['Int']
	edges: Array<SitePageEdge>
	nodes: Array<SitePage>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<SitePageGroupConnection>
}

export type SitePageConnectionDistinctArgs = {
	field: SitePageFieldsEnum
}

export type SitePageConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: SitePageFieldsEnum
}

export type SitePageEdge = {
	next?: Maybe<SitePage>
	node: SitePage
	previous?: Maybe<SitePage>
}

export type SitePageFieldsEnum =
	| 'path'
	| 'component'
	| 'internalComponentName'
	| 'componentChunkName'
	| 'matchPath'
	| 'id'
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'
	| 'isCreatedByStatefulCreatePages'
	| 'context___id'
	| 'pluginCreator___id'
	| 'pluginCreator___parent___id'
	| 'pluginCreator___parent___parent___id'
	| 'pluginCreator___parent___parent___children'
	| 'pluginCreator___parent___children'
	| 'pluginCreator___parent___children___id'
	| 'pluginCreator___parent___children___children'
	| 'pluginCreator___parent___internal___content'
	| 'pluginCreator___parent___internal___contentDigest'
	| 'pluginCreator___parent___internal___description'
	| 'pluginCreator___parent___internal___fieldOwners'
	| 'pluginCreator___parent___internal___ignoreType'
	| 'pluginCreator___parent___internal___mediaType'
	| 'pluginCreator___parent___internal___owner'
	| 'pluginCreator___parent___internal___type'
	| 'pluginCreator___children'
	| 'pluginCreator___children___id'
	| 'pluginCreator___children___parent___id'
	| 'pluginCreator___children___parent___children'
	| 'pluginCreator___children___children'
	| 'pluginCreator___children___children___id'
	| 'pluginCreator___children___children___children'
	| 'pluginCreator___children___internal___content'
	| 'pluginCreator___children___internal___contentDigest'
	| 'pluginCreator___children___internal___description'
	| 'pluginCreator___children___internal___fieldOwners'
	| 'pluginCreator___children___internal___ignoreType'
	| 'pluginCreator___children___internal___mediaType'
	| 'pluginCreator___children___internal___owner'
	| 'pluginCreator___children___internal___type'
	| 'pluginCreator___internal___content'
	| 'pluginCreator___internal___contentDigest'
	| 'pluginCreator___internal___description'
	| 'pluginCreator___internal___fieldOwners'
	| 'pluginCreator___internal___ignoreType'
	| 'pluginCreator___internal___mediaType'
	| 'pluginCreator___internal___owner'
	| 'pluginCreator___internal___type'
	| 'pluginCreator___resolve'
	| 'pluginCreator___name'
	| 'pluginCreator___version'
	| 'pluginCreator___pluginOptions___output'
	| 'pluginCreator___pluginOptions___createLinkInHead'
	| 'pluginCreator___pluginOptions___name'
	| 'pluginCreator___pluginOptions___short_name'
	| 'pluginCreator___pluginOptions___start_url'
	| 'pluginCreator___pluginOptions___background_color'
	| 'pluginCreator___pluginOptions___theme_color'
	| 'pluginCreator___pluginOptions___display'
	| 'pluginCreator___pluginOptions___icon'
	| 'pluginCreator___pluginOptions___legacy'
	| 'pluginCreator___pluginOptions___theme_color_in_head'
	| 'pluginCreator___pluginOptions___cache_busting_mode'
	| 'pluginCreator___pluginOptions___crossOrigin'
	| 'pluginCreator___pluginOptions___include_favicon'
	| 'pluginCreator___pluginOptions___cacheDigest'
	| 'pluginCreator___pluginOptions___base64Width'
	| 'pluginCreator___pluginOptions___stripMetadata'
	| 'pluginCreator___pluginOptions___defaultQuality'
	| 'pluginCreator___pluginOptions___failOnError'
	| 'pluginCreator___pluginOptions___path'
	| 'pluginCreator___pluginOptions___configDir'
	| 'pluginCreator___pluginOptions___pathCheck'
	| 'pluginCreator___pluginOptions___allExtensions'
	| 'pluginCreator___pluginOptions___isTSX'
	| 'pluginCreator___pluginOptions___jsxPragma'
	| 'pluginCreator___pluginOptions___accessToken'
	| 'pluginCreator___pluginOptions___spaceId'
	| 'pluginCreator___pluginOptions___host'
	| 'pluginCreator___pluginOptions___environment'
	| 'pluginCreator___pluginOptions___downloadLocal'
	| 'pluginCreator___pluginOptions___forceFullSync'
	| 'pluginCreator___pluginOptions___pageLimit'
	| 'pluginCreator___pluginOptions___assetDownloadWorkers'
	| 'pluginCreator___pluginOptions___useNameForId'
	| 'pluginCreator___nodeAPIs'
	| 'pluginCreator___browserAPIs'
	| 'pluginCreator___ssrAPIs'
	| 'pluginCreator___pluginFilepath'
	| 'pluginCreator___packageJson___name'
	| 'pluginCreator___packageJson___description'
	| 'pluginCreator___packageJson___version'
	| 'pluginCreator___packageJson___main'
	| 'pluginCreator___packageJson___author'
	| 'pluginCreator___packageJson___license'
	| 'pluginCreator___packageJson___dependencies'
	| 'pluginCreator___packageJson___dependencies___name'
	| 'pluginCreator___packageJson___dependencies___version'
	| 'pluginCreator___packageJson___devDependencies'
	| 'pluginCreator___packageJson___devDependencies___name'
	| 'pluginCreator___packageJson___devDependencies___version'
	| 'pluginCreator___packageJson___peerDependencies'
	| 'pluginCreator___packageJson___peerDependencies___name'
	| 'pluginCreator___packageJson___peerDependencies___version'
	| 'pluginCreator___packageJson___keywords'
	| 'pluginCreatorId'
	| 'componentPath'

export type SitePageGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<SitePageEdge>
	nodes: Array<SitePage>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type SitePageFilterInput = {
	path?: Maybe<StringQueryOperatorInput>
	component?: Maybe<StringQueryOperatorInput>
	internalComponentName?: Maybe<StringQueryOperatorInput>
	componentChunkName?: Maybe<StringQueryOperatorInput>
	matchPath?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
	isCreatedByStatefulCreatePages?: Maybe<BooleanQueryOperatorInput>
	context?: Maybe<SitePageContextFilterInput>
	pluginCreator?: Maybe<SitePluginFilterInput>
	pluginCreatorId?: Maybe<StringQueryOperatorInput>
	componentPath?: Maybe<StringQueryOperatorInput>
}

export type SitePageSortInput = {
	fields?: Maybe<Array<Maybe<SitePageFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type ImageSharpConnection = {
	totalCount: Scalars['Int']
	edges: Array<ImageSharpEdge>
	nodes: Array<ImageSharp>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<ImageSharpGroupConnection>
}

export type ImageSharpConnectionDistinctArgs = {
	field: ImageSharpFieldsEnum
}

export type ImageSharpConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: ImageSharpFieldsEnum
}

export type ImageSharpEdge = {
	next?: Maybe<ImageSharp>
	node: ImageSharp
	previous?: Maybe<ImageSharp>
}

export type ImageSharpFieldsEnum =
	| 'fixed___base64'
	| 'fixed___tracedSVG'
	| 'fixed___aspectRatio'
	| 'fixed___width'
	| 'fixed___height'
	| 'fixed___src'
	| 'fixed___srcSet'
	| 'fixed___srcWebp'
	| 'fixed___srcSetWebp'
	| 'fixed___originalName'
	| 'fluid___base64'
	| 'fluid___tracedSVG'
	| 'fluid___aspectRatio'
	| 'fluid___src'
	| 'fluid___srcSet'
	| 'fluid___srcWebp'
	| 'fluid___srcSetWebp'
	| 'fluid___sizes'
	| 'fluid___originalImg'
	| 'fluid___originalName'
	| 'fluid___presentationWidth'
	| 'fluid___presentationHeight'
	| 'gatsbyImageData'
	| 'original___width'
	| 'original___height'
	| 'original___src'
	| 'resize___src'
	| 'resize___tracedSVG'
	| 'resize___width'
	| 'resize___height'
	| 'resize___aspectRatio'
	| 'resize___originalName'
	| 'id'
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'

export type ImageSharpGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<ImageSharpEdge>
	nodes: Array<ImageSharp>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type ImageSharpSortInput = {
	fields?: Maybe<Array<Maybe<ImageSharpFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type ContentfulEntryConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulEntryEdge>
	nodes: Array<ContentfulEntry>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<ContentfulEntryGroupConnection>
}

export type ContentfulEntryConnectionDistinctArgs = {
	field: ContentfulEntryFieldsEnum
}

export type ContentfulEntryConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: ContentfulEntryFieldsEnum
}

export type ContentfulEntryEdge = {
	next?: Maybe<ContentfulEntry>
	node: ContentfulEntry
	previous?: Maybe<ContentfulEntry>
}

export type ContentfulEntryFieldsEnum =
	| 'contentful_id'
	| 'id'
	| 'node_locale'
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'

export type ContentfulEntryGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulEntryEdge>
	nodes: Array<ContentfulEntry>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type ContentfulEntryFilterInput = {
	contentful_id?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	node_locale?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type ContentfulEntrySortInput = {
	fields?: Maybe<Array<Maybe<ContentfulEntryFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type ContentfulAssetFileFilterInput = {
	url?: Maybe<StringQueryOperatorInput>
	details?: Maybe<ContentfulAssetFileDetailsFilterInput>
	fileName?: Maybe<StringQueryOperatorInput>
	contentType?: Maybe<StringQueryOperatorInput>
}

export type ContentfulAssetFileDetailsFilterInput = {
	size?: Maybe<IntQueryOperatorInput>
	image?: Maybe<ContentfulAssetFileDetailsImageFilterInput>
}

export type ContentfulAssetFileDetailsImageFilterInput = {
	width?: Maybe<IntQueryOperatorInput>
	height?: Maybe<IntQueryOperatorInput>
}

export type ContentfulAssetSysFilterInput = {
	type?: Maybe<StringQueryOperatorInput>
	revision?: Maybe<IntQueryOperatorInput>
}

export type ContentfulFixedFilterInput = {
	base64?: Maybe<StringQueryOperatorInput>
	tracedSVG?: Maybe<StringQueryOperatorInput>
	aspectRatio?: Maybe<FloatQueryOperatorInput>
	width?: Maybe<FloatQueryOperatorInput>
	height?: Maybe<FloatQueryOperatorInput>
	src?: Maybe<StringQueryOperatorInput>
	srcSet?: Maybe<StringQueryOperatorInput>
	srcWebp?: Maybe<StringQueryOperatorInput>
	srcSetWebp?: Maybe<StringQueryOperatorInput>
}

export type ContentfulFluidFilterInput = {
	base64?: Maybe<StringQueryOperatorInput>
	tracedSVG?: Maybe<StringQueryOperatorInput>
	aspectRatio?: Maybe<FloatQueryOperatorInput>
	src?: Maybe<StringQueryOperatorInput>
	srcSet?: Maybe<StringQueryOperatorInput>
	srcWebp?: Maybe<StringQueryOperatorInput>
	srcSetWebp?: Maybe<StringQueryOperatorInput>
	sizes?: Maybe<StringQueryOperatorInput>
}

export type ContentfulResizeFilterInput = {
	base64?: Maybe<StringQueryOperatorInput>
	tracedSVG?: Maybe<StringQueryOperatorInput>
	src?: Maybe<StringQueryOperatorInput>
	width?: Maybe<IntQueryOperatorInput>
	height?: Maybe<IntQueryOperatorInput>
	aspectRatio?: Maybe<FloatQueryOperatorInput>
}

export type ContentfulAssetConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulAssetEdge>
	nodes: Array<ContentfulAsset>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<ContentfulAssetGroupConnection>
}

export type ContentfulAssetConnectionDistinctArgs = {
	field: ContentfulAssetFieldsEnum
}

export type ContentfulAssetConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: ContentfulAssetFieldsEnum
}

export type ContentfulAssetEdge = {
	next?: Maybe<ContentfulAsset>
	node: ContentfulAsset
	previous?: Maybe<ContentfulAsset>
}

export type ContentfulAssetFieldsEnum =
	| 'contentful_id'
	| 'id'
	| 'spaceId'
	| 'createdAt'
	| 'updatedAt'
	| 'file___url'
	| 'file___details___size'
	| 'file___details___image___width'
	| 'file___details___image___height'
	| 'file___fileName'
	| 'file___contentType'
	| 'title'
	| 'description'
	| 'node_locale'
	| 'sys___type'
	| 'sys___revision'
	| 'fixed___base64'
	| 'fixed___tracedSVG'
	| 'fixed___aspectRatio'
	| 'fixed___width'
	| 'fixed___height'
	| 'fixed___src'
	| 'fixed___srcSet'
	| 'fixed___srcWebp'
	| 'fixed___srcSetWebp'
	| 'fluid___base64'
	| 'fluid___tracedSVG'
	| 'fluid___aspectRatio'
	| 'fluid___src'
	| 'fluid___srcSet'
	| 'fluid___srcWebp'
	| 'fluid___srcSetWebp'
	| 'fluid___sizes'
	| 'gatsbyImageData'
	| 'resize___base64'
	| 'resize___tracedSVG'
	| 'resize___src'
	| 'resize___width'
	| 'resize___height'
	| 'resize___aspectRatio'
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'

export type ContentfulAssetGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulAssetEdge>
	nodes: Array<ContentfulAsset>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type ContentfulAssetFilterInput = {
	contentful_id?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	spaceId?: Maybe<StringQueryOperatorInput>
	createdAt?: Maybe<DateQueryOperatorInput>
	updatedAt?: Maybe<DateQueryOperatorInput>
	file?: Maybe<ContentfulAssetFileFilterInput>
	title?: Maybe<StringQueryOperatorInput>
	description?: Maybe<StringQueryOperatorInput>
	node_locale?: Maybe<StringQueryOperatorInput>
	sys?: Maybe<ContentfulAssetSysFilterInput>
	fixed?: Maybe<ContentfulFixedFilterInput>
	fluid?: Maybe<ContentfulFluidFilterInput>
	gatsbyImageData?: Maybe<JsonQueryOperatorInput>
	resize?: Maybe<ContentfulResizeFilterInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type ContentfulAssetSortInput = {
	fields?: Maybe<Array<Maybe<ContentfulAssetFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type ContentfulProjectDescriptionFilterInput = {
	raw?: Maybe<StringQueryOperatorInput>
}

export type ContentfulLinkFilterInput = {
	contentful_id?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	node_locale?: Maybe<StringQueryOperatorInput>
	title?: Maybe<StringQueryOperatorInput>
	url?: Maybe<StringQueryOperatorInput>
	section?: Maybe<ContentfulSectionFilterListInput>
	icon?: Maybe<ContentfulLinkIconTextNodeFilterInput>
	spaceId?: Maybe<StringQueryOperatorInput>
	createdAt?: Maybe<DateQueryOperatorInput>
	updatedAt?: Maybe<DateQueryOperatorInput>
	sys?: Maybe<ContentfulLinkSysFilterInput>
	project?: Maybe<ContentfulProjectFilterListInput>
	childrenContentfulLinkIconTextNode?: Maybe<ContentfulLinkIconTextNodeFilterListInput>
	childContentfulLinkIconTextNode?: Maybe<ContentfulLinkIconTextNodeFilterInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type ContentfulSectionFilterListInput = {
	elemMatch?: Maybe<ContentfulSectionFilterInput>
}

export type ContentfulSectionFilterInput = {
	contentful_id?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	node_locale?: Maybe<StringQueryOperatorInput>
	title?: Maybe<StringQueryOperatorInput>
	page?: Maybe<ContentfulPageFilterListInput>
	spaceId?: Maybe<StringQueryOperatorInput>
	createdAt?: Maybe<DateQueryOperatorInput>
	updatedAt?: Maybe<DateQueryOperatorInput>
	sys?: Maybe<ContentfulSectionSysFilterInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type ContentfulPageFilterListInput = {
	elemMatch?: Maybe<ContentfulPageFilterInput>
}

export type ContentfulPageFilterInput = {
	contentful_id?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	node_locale?: Maybe<StringQueryOperatorInput>
	title?: Maybe<StringQueryOperatorInput>
	slug?: Maybe<StringQueryOperatorInput>
	spaceId?: Maybe<StringQueryOperatorInput>
	createdAt?: Maybe<DateQueryOperatorInput>
	updatedAt?: Maybe<DateQueryOperatorInput>
	sys?: Maybe<ContentfulPageSysFilterInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type ContentfulPageSysFilterInput = {
	type?: Maybe<StringQueryOperatorInput>
	revision?: Maybe<IntQueryOperatorInput>
	contentType?: Maybe<ContentfulPageSysContentTypeFilterInput>
}

export type ContentfulPageSysContentTypeFilterInput = {
	sys?: Maybe<ContentfulPageSysContentTypeSysFilterInput>
}

export type ContentfulPageSysContentTypeSysFilterInput = {
	type?: Maybe<StringQueryOperatorInput>
	linkType?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
}

export type ContentfulSectionSysFilterInput = {
	type?: Maybe<StringQueryOperatorInput>
	revision?: Maybe<IntQueryOperatorInput>
	contentType?: Maybe<ContentfulSectionSysContentTypeFilterInput>
}

export type ContentfulSectionSysContentTypeFilterInput = {
	sys?: Maybe<ContentfulSectionSysContentTypeSysFilterInput>
}

export type ContentfulSectionSysContentTypeSysFilterInput = {
	type?: Maybe<StringQueryOperatorInput>
	linkType?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
}

export type ContentfulLinkIconTextNodeFilterInput = {
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
	icon?: Maybe<StringQueryOperatorInput>
	sys?: Maybe<ContentfulLinkIconTextNodeSysFilterInput>
}

export type ContentfulLinkIconTextNodeSysFilterInput = {
	type?: Maybe<StringQueryOperatorInput>
}

export type ContentfulLinkSysFilterInput = {
	type?: Maybe<StringQueryOperatorInput>
	revision?: Maybe<IntQueryOperatorInput>
	contentType?: Maybe<ContentfulLinkSysContentTypeFilterInput>
}

export type ContentfulLinkSysContentTypeFilterInput = {
	sys?: Maybe<ContentfulLinkSysContentTypeSysFilterInput>
}

export type ContentfulLinkSysContentTypeSysFilterInput = {
	type?: Maybe<StringQueryOperatorInput>
	linkType?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
}

export type ContentfulProjectFilterListInput = {
	elemMatch?: Maybe<ContentfulProjectFilterInput>
}

export type ContentfulProjectFilterInput = {
	contentful_id?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	node_locale?: Maybe<StringQueryOperatorInput>
	title?: Maybe<StringQueryOperatorInput>
	creationDate?: Maybe<DateQueryOperatorInput>
	type?: Maybe<StringQueryOperatorInput>
	description?: Maybe<ContentfulProjectDescriptionFilterInput>
	link?: Maybe<ContentfulLinkFilterInput>
	thumbnail?: Maybe<ContentfulAssetFilterInput>
	section?: Maybe<ContentfulSectionFilterListInput>
	spaceId?: Maybe<StringQueryOperatorInput>
	createdAt?: Maybe<DateQueryOperatorInput>
	updatedAt?: Maybe<DateQueryOperatorInput>
	sys?: Maybe<ContentfulProjectSysFilterInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type ContentfulProjectSysFilterInput = {
	type?: Maybe<StringQueryOperatorInput>
	revision?: Maybe<IntQueryOperatorInput>
	contentType?: Maybe<ContentfulProjectSysContentTypeFilterInput>
}

export type ContentfulProjectSysContentTypeFilterInput = {
	sys?: Maybe<ContentfulProjectSysContentTypeSysFilterInput>
}

export type ContentfulProjectSysContentTypeSysFilterInput = {
	type?: Maybe<StringQueryOperatorInput>
	linkType?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
}

export type ContentfulLinkIconTextNodeFilterListInput = {
	elemMatch?: Maybe<ContentfulLinkIconTextNodeFilterInput>
}

export type ContentfulProjectConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulProjectEdge>
	nodes: Array<ContentfulProject>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<ContentfulProjectGroupConnection>
}

export type ContentfulProjectConnectionDistinctArgs = {
	field: ContentfulProjectFieldsEnum
}

export type ContentfulProjectConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: ContentfulProjectFieldsEnum
}

export type ContentfulProjectEdge = {
	next?: Maybe<ContentfulProject>
	node: ContentfulProject
	previous?: Maybe<ContentfulProject>
}

export type ContentfulProjectFieldsEnum =
	| 'contentful_id'
	| 'id'
	| 'node_locale'
	| 'title'
	| 'creationDate'
	| 'type'
	| 'description___raw'
	| 'link___contentful_id'
	| 'link___id'
	| 'link___node_locale'
	| 'link___title'
	| 'link___url'
	| 'link___section'
	| 'link___section___contentful_id'
	| 'link___section___id'
	| 'link___section___node_locale'
	| 'link___section___title'
	| 'link___section___page'
	| 'link___section___page___contentful_id'
	| 'link___section___page___id'
	| 'link___section___page___node_locale'
	| 'link___section___page___title'
	| 'link___section___page___slug'
	| 'link___section___page___spaceId'
	| 'link___section___page___createdAt'
	| 'link___section___page___updatedAt'
	| 'link___section___page___children'
	| 'link___section___spaceId'
	| 'link___section___createdAt'
	| 'link___section___updatedAt'
	| 'link___section___sys___type'
	| 'link___section___sys___revision'
	| 'link___section___parent___id'
	| 'link___section___parent___children'
	| 'link___section___children'
	| 'link___section___children___id'
	| 'link___section___children___children'
	| 'link___section___internal___content'
	| 'link___section___internal___contentDigest'
	| 'link___section___internal___description'
	| 'link___section___internal___fieldOwners'
	| 'link___section___internal___ignoreType'
	| 'link___section___internal___mediaType'
	| 'link___section___internal___owner'
	| 'link___section___internal___type'
	| 'link___icon___id'
	| 'link___icon___parent___id'
	| 'link___icon___parent___children'
	| 'link___icon___children'
	| 'link___icon___children___id'
	| 'link___icon___children___children'
	| 'link___icon___internal___content'
	| 'link___icon___internal___contentDigest'
	| 'link___icon___internal___description'
	| 'link___icon___internal___fieldOwners'
	| 'link___icon___internal___ignoreType'
	| 'link___icon___internal___mediaType'
	| 'link___icon___internal___owner'
	| 'link___icon___internal___type'
	| 'link___icon___icon'
	| 'link___icon___sys___type'
	| 'link___spaceId'
	| 'link___createdAt'
	| 'link___updatedAt'
	| 'link___sys___type'
	| 'link___sys___revision'
	| 'link___project'
	| 'link___project___contentful_id'
	| 'link___project___id'
	| 'link___project___node_locale'
	| 'link___project___title'
	| 'link___project___creationDate'
	| 'link___project___type'
	| 'link___project___description___raw'
	| 'link___project___link___contentful_id'
	| 'link___project___link___id'
	| 'link___project___link___node_locale'
	| 'link___project___link___title'
	| 'link___project___link___url'
	| 'link___project___link___section'
	| 'link___project___link___spaceId'
	| 'link___project___link___createdAt'
	| 'link___project___link___updatedAt'
	| 'link___project___link___project'
	| 'link___project___link___childrenContentfulLinkIconTextNode'
	| 'link___project___link___children'
	| 'link___project___thumbnail___contentful_id'
	| 'link___project___thumbnail___id'
	| 'link___project___thumbnail___spaceId'
	| 'link___project___thumbnail___createdAt'
	| 'link___project___thumbnail___updatedAt'
	| 'link___project___thumbnail___title'
	| 'link___project___thumbnail___description'
	| 'link___project___thumbnail___node_locale'
	| 'link___project___thumbnail___gatsbyImageData'
	| 'link___project___thumbnail___children'
	| 'link___project___section'
	| 'link___project___section___contentful_id'
	| 'link___project___section___id'
	| 'link___project___section___node_locale'
	| 'link___project___section___title'
	| 'link___project___section___page'
	| 'link___project___section___spaceId'
	| 'link___project___section___createdAt'
	| 'link___project___section___updatedAt'
	| 'link___project___section___children'
	| 'link___project___spaceId'
	| 'link___project___createdAt'
	| 'link___project___updatedAt'
	| 'link___project___sys___type'
	| 'link___project___sys___revision'
	| 'link___project___parent___id'
	| 'link___project___parent___children'
	| 'link___project___children'
	| 'link___project___children___id'
	| 'link___project___children___children'
	| 'link___project___internal___content'
	| 'link___project___internal___contentDigest'
	| 'link___project___internal___description'
	| 'link___project___internal___fieldOwners'
	| 'link___project___internal___ignoreType'
	| 'link___project___internal___mediaType'
	| 'link___project___internal___owner'
	| 'link___project___internal___type'
	| 'link___childrenContentfulLinkIconTextNode'
	| 'link___childrenContentfulLinkIconTextNode___id'
	| 'link___childrenContentfulLinkIconTextNode___parent___id'
	| 'link___childrenContentfulLinkIconTextNode___parent___children'
	| 'link___childrenContentfulLinkIconTextNode___children'
	| 'link___childrenContentfulLinkIconTextNode___children___id'
	| 'link___childrenContentfulLinkIconTextNode___children___children'
	| 'link___childrenContentfulLinkIconTextNode___internal___content'
	| 'link___childrenContentfulLinkIconTextNode___internal___contentDigest'
	| 'link___childrenContentfulLinkIconTextNode___internal___description'
	| 'link___childrenContentfulLinkIconTextNode___internal___fieldOwners'
	| 'link___childrenContentfulLinkIconTextNode___internal___ignoreType'
	| 'link___childrenContentfulLinkIconTextNode___internal___mediaType'
	| 'link___childrenContentfulLinkIconTextNode___internal___owner'
	| 'link___childrenContentfulLinkIconTextNode___internal___type'
	| 'link___childrenContentfulLinkIconTextNode___icon'
	| 'link___childrenContentfulLinkIconTextNode___sys___type'
	| 'link___childContentfulLinkIconTextNode___id'
	| 'link___childContentfulLinkIconTextNode___parent___id'
	| 'link___childContentfulLinkIconTextNode___parent___children'
	| 'link___childContentfulLinkIconTextNode___children'
	| 'link___childContentfulLinkIconTextNode___children___id'
	| 'link___childContentfulLinkIconTextNode___children___children'
	| 'link___childContentfulLinkIconTextNode___internal___content'
	| 'link___childContentfulLinkIconTextNode___internal___contentDigest'
	| 'link___childContentfulLinkIconTextNode___internal___description'
	| 'link___childContentfulLinkIconTextNode___internal___fieldOwners'
	| 'link___childContentfulLinkIconTextNode___internal___ignoreType'
	| 'link___childContentfulLinkIconTextNode___internal___mediaType'
	| 'link___childContentfulLinkIconTextNode___internal___owner'
	| 'link___childContentfulLinkIconTextNode___internal___type'
	| 'link___childContentfulLinkIconTextNode___icon'
	| 'link___childContentfulLinkIconTextNode___sys___type'
	| 'link___parent___id'
	| 'link___parent___parent___id'
	| 'link___parent___parent___children'
	| 'link___parent___children'
	| 'link___parent___children___id'
	| 'link___parent___children___children'
	| 'link___parent___internal___content'
	| 'link___parent___internal___contentDigest'
	| 'link___parent___internal___description'
	| 'link___parent___internal___fieldOwners'
	| 'link___parent___internal___ignoreType'
	| 'link___parent___internal___mediaType'
	| 'link___parent___internal___owner'
	| 'link___parent___internal___type'
	| 'link___children'
	| 'link___children___id'
	| 'link___children___parent___id'
	| 'link___children___parent___children'
	| 'link___children___children'
	| 'link___children___children___id'
	| 'link___children___children___children'
	| 'link___children___internal___content'
	| 'link___children___internal___contentDigest'
	| 'link___children___internal___description'
	| 'link___children___internal___fieldOwners'
	| 'link___children___internal___ignoreType'
	| 'link___children___internal___mediaType'
	| 'link___children___internal___owner'
	| 'link___children___internal___type'
	| 'link___internal___content'
	| 'link___internal___contentDigest'
	| 'link___internal___description'
	| 'link___internal___fieldOwners'
	| 'link___internal___ignoreType'
	| 'link___internal___mediaType'
	| 'link___internal___owner'
	| 'link___internal___type'
	| 'thumbnail___contentful_id'
	| 'thumbnail___id'
	| 'thumbnail___spaceId'
	| 'thumbnail___createdAt'
	| 'thumbnail___updatedAt'
	| 'thumbnail___file___url'
	| 'thumbnail___file___details___size'
	| 'thumbnail___file___fileName'
	| 'thumbnail___file___contentType'
	| 'thumbnail___title'
	| 'thumbnail___description'
	| 'thumbnail___node_locale'
	| 'thumbnail___sys___type'
	| 'thumbnail___sys___revision'
	| 'thumbnail___fixed___base64'
	| 'thumbnail___fixed___tracedSVG'
	| 'thumbnail___fixed___aspectRatio'
	| 'thumbnail___fixed___width'
	| 'thumbnail___fixed___height'
	| 'thumbnail___fixed___src'
	| 'thumbnail___fixed___srcSet'
	| 'thumbnail___fixed___srcWebp'
	| 'thumbnail___fixed___srcSetWebp'
	| 'thumbnail___fluid___base64'
	| 'thumbnail___fluid___tracedSVG'
	| 'thumbnail___fluid___aspectRatio'
	| 'thumbnail___fluid___src'
	| 'thumbnail___fluid___srcSet'
	| 'thumbnail___fluid___srcWebp'
	| 'thumbnail___fluid___srcSetWebp'
	| 'thumbnail___fluid___sizes'
	| 'thumbnail___gatsbyImageData'
	| 'thumbnail___resize___base64'
	| 'thumbnail___resize___tracedSVG'
	| 'thumbnail___resize___src'
	| 'thumbnail___resize___width'
	| 'thumbnail___resize___height'
	| 'thumbnail___resize___aspectRatio'
	| 'thumbnail___parent___id'
	| 'thumbnail___parent___parent___id'
	| 'thumbnail___parent___parent___children'
	| 'thumbnail___parent___children'
	| 'thumbnail___parent___children___id'
	| 'thumbnail___parent___children___children'
	| 'thumbnail___parent___internal___content'
	| 'thumbnail___parent___internal___contentDigest'
	| 'thumbnail___parent___internal___description'
	| 'thumbnail___parent___internal___fieldOwners'
	| 'thumbnail___parent___internal___ignoreType'
	| 'thumbnail___parent___internal___mediaType'
	| 'thumbnail___parent___internal___owner'
	| 'thumbnail___parent___internal___type'
	| 'thumbnail___children'
	| 'thumbnail___children___id'
	| 'thumbnail___children___parent___id'
	| 'thumbnail___children___parent___children'
	| 'thumbnail___children___children'
	| 'thumbnail___children___children___id'
	| 'thumbnail___children___children___children'
	| 'thumbnail___children___internal___content'
	| 'thumbnail___children___internal___contentDigest'
	| 'thumbnail___children___internal___description'
	| 'thumbnail___children___internal___fieldOwners'
	| 'thumbnail___children___internal___ignoreType'
	| 'thumbnail___children___internal___mediaType'
	| 'thumbnail___children___internal___owner'
	| 'thumbnail___children___internal___type'
	| 'thumbnail___internal___content'
	| 'thumbnail___internal___contentDigest'
	| 'thumbnail___internal___description'
	| 'thumbnail___internal___fieldOwners'
	| 'thumbnail___internal___ignoreType'
	| 'thumbnail___internal___mediaType'
	| 'thumbnail___internal___owner'
	| 'thumbnail___internal___type'
	| 'section'
	| 'section___contentful_id'
	| 'section___id'
	| 'section___node_locale'
	| 'section___title'
	| 'section___page'
	| 'section___page___contentful_id'
	| 'section___page___id'
	| 'section___page___node_locale'
	| 'section___page___title'
	| 'section___page___slug'
	| 'section___page___spaceId'
	| 'section___page___createdAt'
	| 'section___page___updatedAt'
	| 'section___page___sys___type'
	| 'section___page___sys___revision'
	| 'section___page___parent___id'
	| 'section___page___parent___children'
	| 'section___page___children'
	| 'section___page___children___id'
	| 'section___page___children___children'
	| 'section___page___internal___content'
	| 'section___page___internal___contentDigest'
	| 'section___page___internal___description'
	| 'section___page___internal___fieldOwners'
	| 'section___page___internal___ignoreType'
	| 'section___page___internal___mediaType'
	| 'section___page___internal___owner'
	| 'section___page___internal___type'
	| 'section___spaceId'
	| 'section___createdAt'
	| 'section___updatedAt'
	| 'section___sys___type'
	| 'section___sys___revision'
	| 'section___parent___id'
	| 'section___parent___parent___id'
	| 'section___parent___parent___children'
	| 'section___parent___children'
	| 'section___parent___children___id'
	| 'section___parent___children___children'
	| 'section___parent___internal___content'
	| 'section___parent___internal___contentDigest'
	| 'section___parent___internal___description'
	| 'section___parent___internal___fieldOwners'
	| 'section___parent___internal___ignoreType'
	| 'section___parent___internal___mediaType'
	| 'section___parent___internal___owner'
	| 'section___parent___internal___type'
	| 'section___children'
	| 'section___children___id'
	| 'section___children___parent___id'
	| 'section___children___parent___children'
	| 'section___children___children'
	| 'section___children___children___id'
	| 'section___children___children___children'
	| 'section___children___internal___content'
	| 'section___children___internal___contentDigest'
	| 'section___children___internal___description'
	| 'section___children___internal___fieldOwners'
	| 'section___children___internal___ignoreType'
	| 'section___children___internal___mediaType'
	| 'section___children___internal___owner'
	| 'section___children___internal___type'
	| 'section___internal___content'
	| 'section___internal___contentDigest'
	| 'section___internal___description'
	| 'section___internal___fieldOwners'
	| 'section___internal___ignoreType'
	| 'section___internal___mediaType'
	| 'section___internal___owner'
	| 'section___internal___type'
	| 'spaceId'
	| 'createdAt'
	| 'updatedAt'
	| 'sys___type'
	| 'sys___revision'
	| 'sys___contentType___sys___type'
	| 'sys___contentType___sys___linkType'
	| 'sys___contentType___sys___id'
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'

export type ContentfulProjectGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulProjectEdge>
	nodes: Array<ContentfulProject>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type ContentfulProjectSortInput = {
	fields?: Maybe<Array<Maybe<ContentfulProjectFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type ContentfulBookConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulBookEdge>
	nodes: Array<ContentfulBook>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<ContentfulBookGroupConnection>
}

export type ContentfulBookConnectionDistinctArgs = {
	field: ContentfulBookFieldsEnum
}

export type ContentfulBookConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: ContentfulBookFieldsEnum
}

export type ContentfulBookEdge = {
	next?: Maybe<ContentfulBook>
	node: ContentfulBook
	previous?: Maybe<ContentfulBook>
}

export type ContentfulBookFieldsEnum =
	| 'contentful_id'
	| 'id'
	| 'node_locale'
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'

export type ContentfulBookGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulBookEdge>
	nodes: Array<ContentfulBook>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type ContentfulBookFilterInput = {
	contentful_id?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	node_locale?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type ContentfulBookSortInput = {
	fields?: Maybe<Array<Maybe<ContentfulBookFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type ContentfulLinkConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulLinkEdge>
	nodes: Array<ContentfulLink>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<ContentfulLinkGroupConnection>
}

export type ContentfulLinkConnectionDistinctArgs = {
	field: ContentfulLinkFieldsEnum
}

export type ContentfulLinkConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: ContentfulLinkFieldsEnum
}

export type ContentfulLinkEdge = {
	next?: Maybe<ContentfulLink>
	node: ContentfulLink
	previous?: Maybe<ContentfulLink>
}

export type ContentfulLinkFieldsEnum =
	| 'contentful_id'
	| 'id'
	| 'node_locale'
	| 'title'
	| 'url'
	| 'section'
	| 'section___contentful_id'
	| 'section___id'
	| 'section___node_locale'
	| 'section___title'
	| 'section___page'
	| 'section___page___contentful_id'
	| 'section___page___id'
	| 'section___page___node_locale'
	| 'section___page___title'
	| 'section___page___slug'
	| 'section___page___spaceId'
	| 'section___page___createdAt'
	| 'section___page___updatedAt'
	| 'section___page___sys___type'
	| 'section___page___sys___revision'
	| 'section___page___parent___id'
	| 'section___page___parent___children'
	| 'section___page___children'
	| 'section___page___children___id'
	| 'section___page___children___children'
	| 'section___page___internal___content'
	| 'section___page___internal___contentDigest'
	| 'section___page___internal___description'
	| 'section___page___internal___fieldOwners'
	| 'section___page___internal___ignoreType'
	| 'section___page___internal___mediaType'
	| 'section___page___internal___owner'
	| 'section___page___internal___type'
	| 'section___spaceId'
	| 'section___createdAt'
	| 'section___updatedAt'
	| 'section___sys___type'
	| 'section___sys___revision'
	| 'section___parent___id'
	| 'section___parent___parent___id'
	| 'section___parent___parent___children'
	| 'section___parent___children'
	| 'section___parent___children___id'
	| 'section___parent___children___children'
	| 'section___parent___internal___content'
	| 'section___parent___internal___contentDigest'
	| 'section___parent___internal___description'
	| 'section___parent___internal___fieldOwners'
	| 'section___parent___internal___ignoreType'
	| 'section___parent___internal___mediaType'
	| 'section___parent___internal___owner'
	| 'section___parent___internal___type'
	| 'section___children'
	| 'section___children___id'
	| 'section___children___parent___id'
	| 'section___children___parent___children'
	| 'section___children___children'
	| 'section___children___children___id'
	| 'section___children___children___children'
	| 'section___children___internal___content'
	| 'section___children___internal___contentDigest'
	| 'section___children___internal___description'
	| 'section___children___internal___fieldOwners'
	| 'section___children___internal___ignoreType'
	| 'section___children___internal___mediaType'
	| 'section___children___internal___owner'
	| 'section___children___internal___type'
	| 'section___internal___content'
	| 'section___internal___contentDigest'
	| 'section___internal___description'
	| 'section___internal___fieldOwners'
	| 'section___internal___ignoreType'
	| 'section___internal___mediaType'
	| 'section___internal___owner'
	| 'section___internal___type'
	| 'icon___id'
	| 'icon___parent___id'
	| 'icon___parent___parent___id'
	| 'icon___parent___parent___children'
	| 'icon___parent___children'
	| 'icon___parent___children___id'
	| 'icon___parent___children___children'
	| 'icon___parent___internal___content'
	| 'icon___parent___internal___contentDigest'
	| 'icon___parent___internal___description'
	| 'icon___parent___internal___fieldOwners'
	| 'icon___parent___internal___ignoreType'
	| 'icon___parent___internal___mediaType'
	| 'icon___parent___internal___owner'
	| 'icon___parent___internal___type'
	| 'icon___children'
	| 'icon___children___id'
	| 'icon___children___parent___id'
	| 'icon___children___parent___children'
	| 'icon___children___children'
	| 'icon___children___children___id'
	| 'icon___children___children___children'
	| 'icon___children___internal___content'
	| 'icon___children___internal___contentDigest'
	| 'icon___children___internal___description'
	| 'icon___children___internal___fieldOwners'
	| 'icon___children___internal___ignoreType'
	| 'icon___children___internal___mediaType'
	| 'icon___children___internal___owner'
	| 'icon___children___internal___type'
	| 'icon___internal___content'
	| 'icon___internal___contentDigest'
	| 'icon___internal___description'
	| 'icon___internal___fieldOwners'
	| 'icon___internal___ignoreType'
	| 'icon___internal___mediaType'
	| 'icon___internal___owner'
	| 'icon___internal___type'
	| 'icon___icon'
	| 'icon___sys___type'
	| 'spaceId'
	| 'createdAt'
	| 'updatedAt'
	| 'sys___type'
	| 'sys___revision'
	| 'sys___contentType___sys___type'
	| 'sys___contentType___sys___linkType'
	| 'sys___contentType___sys___id'
	| 'project'
	| 'project___contentful_id'
	| 'project___id'
	| 'project___node_locale'
	| 'project___title'
	| 'project___creationDate'
	| 'project___type'
	| 'project___description___raw'
	| 'project___link___contentful_id'
	| 'project___link___id'
	| 'project___link___node_locale'
	| 'project___link___title'
	| 'project___link___url'
	| 'project___link___section'
	| 'project___link___section___contentful_id'
	| 'project___link___section___id'
	| 'project___link___section___node_locale'
	| 'project___link___section___title'
	| 'project___link___section___page'
	| 'project___link___section___spaceId'
	| 'project___link___section___createdAt'
	| 'project___link___section___updatedAt'
	| 'project___link___section___children'
	| 'project___link___icon___id'
	| 'project___link___icon___children'
	| 'project___link___icon___icon'
	| 'project___link___spaceId'
	| 'project___link___createdAt'
	| 'project___link___updatedAt'
	| 'project___link___sys___type'
	| 'project___link___sys___revision'
	| 'project___link___project'
	| 'project___link___project___contentful_id'
	| 'project___link___project___id'
	| 'project___link___project___node_locale'
	| 'project___link___project___title'
	| 'project___link___project___creationDate'
	| 'project___link___project___type'
	| 'project___link___project___section'
	| 'project___link___project___spaceId'
	| 'project___link___project___createdAt'
	| 'project___link___project___updatedAt'
	| 'project___link___project___children'
	| 'project___link___childrenContentfulLinkIconTextNode'
	| 'project___link___childrenContentfulLinkIconTextNode___id'
	| 'project___link___childrenContentfulLinkIconTextNode___children'
	| 'project___link___childrenContentfulLinkIconTextNode___icon'
	| 'project___link___childContentfulLinkIconTextNode___id'
	| 'project___link___childContentfulLinkIconTextNode___children'
	| 'project___link___childContentfulLinkIconTextNode___icon'
	| 'project___link___parent___id'
	| 'project___link___parent___children'
	| 'project___link___children'
	| 'project___link___children___id'
	| 'project___link___children___children'
	| 'project___link___internal___content'
	| 'project___link___internal___contentDigest'
	| 'project___link___internal___description'
	| 'project___link___internal___fieldOwners'
	| 'project___link___internal___ignoreType'
	| 'project___link___internal___mediaType'
	| 'project___link___internal___owner'
	| 'project___link___internal___type'
	| 'project___thumbnail___contentful_id'
	| 'project___thumbnail___id'
	| 'project___thumbnail___spaceId'
	| 'project___thumbnail___createdAt'
	| 'project___thumbnail___updatedAt'
	| 'project___thumbnail___file___url'
	| 'project___thumbnail___file___fileName'
	| 'project___thumbnail___file___contentType'
	| 'project___thumbnail___title'
	| 'project___thumbnail___description'
	| 'project___thumbnail___node_locale'
	| 'project___thumbnail___sys___type'
	| 'project___thumbnail___sys___revision'
	| 'project___thumbnail___fixed___base64'
	| 'project___thumbnail___fixed___tracedSVG'
	| 'project___thumbnail___fixed___aspectRatio'
	| 'project___thumbnail___fixed___width'
	| 'project___thumbnail___fixed___height'
	| 'project___thumbnail___fixed___src'
	| 'project___thumbnail___fixed___srcSet'
	| 'project___thumbnail___fixed___srcWebp'
	| 'project___thumbnail___fixed___srcSetWebp'
	| 'project___thumbnail___fluid___base64'
	| 'project___thumbnail___fluid___tracedSVG'
	| 'project___thumbnail___fluid___aspectRatio'
	| 'project___thumbnail___fluid___src'
	| 'project___thumbnail___fluid___srcSet'
	| 'project___thumbnail___fluid___srcWebp'
	| 'project___thumbnail___fluid___srcSetWebp'
	| 'project___thumbnail___fluid___sizes'
	| 'project___thumbnail___gatsbyImageData'
	| 'project___thumbnail___resize___base64'
	| 'project___thumbnail___resize___tracedSVG'
	| 'project___thumbnail___resize___src'
	| 'project___thumbnail___resize___width'
	| 'project___thumbnail___resize___height'
	| 'project___thumbnail___resize___aspectRatio'
	| 'project___thumbnail___parent___id'
	| 'project___thumbnail___parent___children'
	| 'project___thumbnail___children'
	| 'project___thumbnail___children___id'
	| 'project___thumbnail___children___children'
	| 'project___thumbnail___internal___content'
	| 'project___thumbnail___internal___contentDigest'
	| 'project___thumbnail___internal___description'
	| 'project___thumbnail___internal___fieldOwners'
	| 'project___thumbnail___internal___ignoreType'
	| 'project___thumbnail___internal___mediaType'
	| 'project___thumbnail___internal___owner'
	| 'project___thumbnail___internal___type'
	| 'project___section'
	| 'project___section___contentful_id'
	| 'project___section___id'
	| 'project___section___node_locale'
	| 'project___section___title'
	| 'project___section___page'
	| 'project___section___page___contentful_id'
	| 'project___section___page___id'
	| 'project___section___page___node_locale'
	| 'project___section___page___title'
	| 'project___section___page___slug'
	| 'project___section___page___spaceId'
	| 'project___section___page___createdAt'
	| 'project___section___page___updatedAt'
	| 'project___section___page___children'
	| 'project___section___spaceId'
	| 'project___section___createdAt'
	| 'project___section___updatedAt'
	| 'project___section___sys___type'
	| 'project___section___sys___revision'
	| 'project___section___parent___id'
	| 'project___section___parent___children'
	| 'project___section___children'
	| 'project___section___children___id'
	| 'project___section___children___children'
	| 'project___section___internal___content'
	| 'project___section___internal___contentDigest'
	| 'project___section___internal___description'
	| 'project___section___internal___fieldOwners'
	| 'project___section___internal___ignoreType'
	| 'project___section___internal___mediaType'
	| 'project___section___internal___owner'
	| 'project___section___internal___type'
	| 'project___spaceId'
	| 'project___createdAt'
	| 'project___updatedAt'
	| 'project___sys___type'
	| 'project___sys___revision'
	| 'project___parent___id'
	| 'project___parent___parent___id'
	| 'project___parent___parent___children'
	| 'project___parent___children'
	| 'project___parent___children___id'
	| 'project___parent___children___children'
	| 'project___parent___internal___content'
	| 'project___parent___internal___contentDigest'
	| 'project___parent___internal___description'
	| 'project___parent___internal___fieldOwners'
	| 'project___parent___internal___ignoreType'
	| 'project___parent___internal___mediaType'
	| 'project___parent___internal___owner'
	| 'project___parent___internal___type'
	| 'project___children'
	| 'project___children___id'
	| 'project___children___parent___id'
	| 'project___children___parent___children'
	| 'project___children___children'
	| 'project___children___children___id'
	| 'project___children___children___children'
	| 'project___children___internal___content'
	| 'project___children___internal___contentDigest'
	| 'project___children___internal___description'
	| 'project___children___internal___fieldOwners'
	| 'project___children___internal___ignoreType'
	| 'project___children___internal___mediaType'
	| 'project___children___internal___owner'
	| 'project___children___internal___type'
	| 'project___internal___content'
	| 'project___internal___contentDigest'
	| 'project___internal___description'
	| 'project___internal___fieldOwners'
	| 'project___internal___ignoreType'
	| 'project___internal___mediaType'
	| 'project___internal___owner'
	| 'project___internal___type'
	| 'childrenContentfulLinkIconTextNode'
	| 'childrenContentfulLinkIconTextNode___id'
	| 'childrenContentfulLinkIconTextNode___parent___id'
	| 'childrenContentfulLinkIconTextNode___parent___parent___id'
	| 'childrenContentfulLinkIconTextNode___parent___parent___children'
	| 'childrenContentfulLinkIconTextNode___parent___children'
	| 'childrenContentfulLinkIconTextNode___parent___children___id'
	| 'childrenContentfulLinkIconTextNode___parent___children___children'
	| 'childrenContentfulLinkIconTextNode___parent___internal___content'
	| 'childrenContentfulLinkIconTextNode___parent___internal___contentDigest'
	| 'childrenContentfulLinkIconTextNode___parent___internal___description'
	| 'childrenContentfulLinkIconTextNode___parent___internal___fieldOwners'
	| 'childrenContentfulLinkIconTextNode___parent___internal___ignoreType'
	| 'childrenContentfulLinkIconTextNode___parent___internal___mediaType'
	| 'childrenContentfulLinkIconTextNode___parent___internal___owner'
	| 'childrenContentfulLinkIconTextNode___parent___internal___type'
	| 'childrenContentfulLinkIconTextNode___children'
	| 'childrenContentfulLinkIconTextNode___children___id'
	| 'childrenContentfulLinkIconTextNode___children___parent___id'
	| 'childrenContentfulLinkIconTextNode___children___parent___children'
	| 'childrenContentfulLinkIconTextNode___children___children'
	| 'childrenContentfulLinkIconTextNode___children___children___id'
	| 'childrenContentfulLinkIconTextNode___children___children___children'
	| 'childrenContentfulLinkIconTextNode___children___internal___content'
	| 'childrenContentfulLinkIconTextNode___children___internal___contentDigest'
	| 'childrenContentfulLinkIconTextNode___children___internal___description'
	| 'childrenContentfulLinkIconTextNode___children___internal___fieldOwners'
	| 'childrenContentfulLinkIconTextNode___children___internal___ignoreType'
	| 'childrenContentfulLinkIconTextNode___children___internal___mediaType'
	| 'childrenContentfulLinkIconTextNode___children___internal___owner'
	| 'childrenContentfulLinkIconTextNode___children___internal___type'
	| 'childrenContentfulLinkIconTextNode___internal___content'
	| 'childrenContentfulLinkIconTextNode___internal___contentDigest'
	| 'childrenContentfulLinkIconTextNode___internal___description'
	| 'childrenContentfulLinkIconTextNode___internal___fieldOwners'
	| 'childrenContentfulLinkIconTextNode___internal___ignoreType'
	| 'childrenContentfulLinkIconTextNode___internal___mediaType'
	| 'childrenContentfulLinkIconTextNode___internal___owner'
	| 'childrenContentfulLinkIconTextNode___internal___type'
	| 'childrenContentfulLinkIconTextNode___icon'
	| 'childrenContentfulLinkIconTextNode___sys___type'
	| 'childContentfulLinkIconTextNode___id'
	| 'childContentfulLinkIconTextNode___parent___id'
	| 'childContentfulLinkIconTextNode___parent___parent___id'
	| 'childContentfulLinkIconTextNode___parent___parent___children'
	| 'childContentfulLinkIconTextNode___parent___children'
	| 'childContentfulLinkIconTextNode___parent___children___id'
	| 'childContentfulLinkIconTextNode___parent___children___children'
	| 'childContentfulLinkIconTextNode___parent___internal___content'
	| 'childContentfulLinkIconTextNode___parent___internal___contentDigest'
	| 'childContentfulLinkIconTextNode___parent___internal___description'
	| 'childContentfulLinkIconTextNode___parent___internal___fieldOwners'
	| 'childContentfulLinkIconTextNode___parent___internal___ignoreType'
	| 'childContentfulLinkIconTextNode___parent___internal___mediaType'
	| 'childContentfulLinkIconTextNode___parent___internal___owner'
	| 'childContentfulLinkIconTextNode___parent___internal___type'
	| 'childContentfulLinkIconTextNode___children'
	| 'childContentfulLinkIconTextNode___children___id'
	| 'childContentfulLinkIconTextNode___children___parent___id'
	| 'childContentfulLinkIconTextNode___children___parent___children'
	| 'childContentfulLinkIconTextNode___children___children'
	| 'childContentfulLinkIconTextNode___children___children___id'
	| 'childContentfulLinkIconTextNode___children___children___children'
	| 'childContentfulLinkIconTextNode___children___internal___content'
	| 'childContentfulLinkIconTextNode___children___internal___contentDigest'
	| 'childContentfulLinkIconTextNode___children___internal___description'
	| 'childContentfulLinkIconTextNode___children___internal___fieldOwners'
	| 'childContentfulLinkIconTextNode___children___internal___ignoreType'
	| 'childContentfulLinkIconTextNode___children___internal___mediaType'
	| 'childContentfulLinkIconTextNode___children___internal___owner'
	| 'childContentfulLinkIconTextNode___children___internal___type'
	| 'childContentfulLinkIconTextNode___internal___content'
	| 'childContentfulLinkIconTextNode___internal___contentDigest'
	| 'childContentfulLinkIconTextNode___internal___description'
	| 'childContentfulLinkIconTextNode___internal___fieldOwners'
	| 'childContentfulLinkIconTextNode___internal___ignoreType'
	| 'childContentfulLinkIconTextNode___internal___mediaType'
	| 'childContentfulLinkIconTextNode___internal___owner'
	| 'childContentfulLinkIconTextNode___internal___type'
	| 'childContentfulLinkIconTextNode___icon'
	| 'childContentfulLinkIconTextNode___sys___type'
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'

export type ContentfulLinkGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulLinkEdge>
	nodes: Array<ContentfulLink>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type ContentfulLinkSortInput = {
	fields?: Maybe<Array<Maybe<ContentfulLinkFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type ContentfulPageConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulPageEdge>
	nodes: Array<ContentfulPage>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<ContentfulPageGroupConnection>
}

export type ContentfulPageConnectionDistinctArgs = {
	field: ContentfulPageFieldsEnum
}

export type ContentfulPageConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: ContentfulPageFieldsEnum
}

export type ContentfulPageEdge = {
	next?: Maybe<ContentfulPage>
	node: ContentfulPage
	previous?: Maybe<ContentfulPage>
}

export type ContentfulPageFieldsEnum =
	| 'contentful_id'
	| 'id'
	| 'node_locale'
	| 'title'
	| 'slug'
	| 'spaceId'
	| 'createdAt'
	| 'updatedAt'
	| 'sys___type'
	| 'sys___revision'
	| 'sys___contentType___sys___type'
	| 'sys___contentType___sys___linkType'
	| 'sys___contentType___sys___id'
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'

export type ContentfulPageGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulPageEdge>
	nodes: Array<ContentfulPage>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type ContentfulPageSortInput = {
	fields?: Maybe<Array<Maybe<ContentfulPageFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type ContentfulSectionConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulSectionEdge>
	nodes: Array<ContentfulSection>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<ContentfulSectionGroupConnection>
}

export type ContentfulSectionConnectionDistinctArgs = {
	field: ContentfulSectionFieldsEnum
}

export type ContentfulSectionConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: ContentfulSectionFieldsEnum
}

export type ContentfulSectionEdge = {
	next?: Maybe<ContentfulSection>
	node: ContentfulSection
	previous?: Maybe<ContentfulSection>
}

export type ContentfulSectionFieldsEnum =
	| 'contentful_id'
	| 'id'
	| 'node_locale'
	| 'title'
	| 'page'
	| 'page___contentful_id'
	| 'page___id'
	| 'page___node_locale'
	| 'page___title'
	| 'page___slug'
	| 'page___spaceId'
	| 'page___createdAt'
	| 'page___updatedAt'
	| 'page___sys___type'
	| 'page___sys___revision'
	| 'page___parent___id'
	| 'page___parent___parent___id'
	| 'page___parent___parent___children'
	| 'page___parent___children'
	| 'page___parent___children___id'
	| 'page___parent___children___children'
	| 'page___parent___internal___content'
	| 'page___parent___internal___contentDigest'
	| 'page___parent___internal___description'
	| 'page___parent___internal___fieldOwners'
	| 'page___parent___internal___ignoreType'
	| 'page___parent___internal___mediaType'
	| 'page___parent___internal___owner'
	| 'page___parent___internal___type'
	| 'page___children'
	| 'page___children___id'
	| 'page___children___parent___id'
	| 'page___children___parent___children'
	| 'page___children___children'
	| 'page___children___children___id'
	| 'page___children___children___children'
	| 'page___children___internal___content'
	| 'page___children___internal___contentDigest'
	| 'page___children___internal___description'
	| 'page___children___internal___fieldOwners'
	| 'page___children___internal___ignoreType'
	| 'page___children___internal___mediaType'
	| 'page___children___internal___owner'
	| 'page___children___internal___type'
	| 'page___internal___content'
	| 'page___internal___contentDigest'
	| 'page___internal___description'
	| 'page___internal___fieldOwners'
	| 'page___internal___ignoreType'
	| 'page___internal___mediaType'
	| 'page___internal___owner'
	| 'page___internal___type'
	| 'spaceId'
	| 'createdAt'
	| 'updatedAt'
	| 'sys___type'
	| 'sys___revision'
	| 'sys___contentType___sys___type'
	| 'sys___contentType___sys___linkType'
	| 'sys___contentType___sys___id'
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'

export type ContentfulSectionGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulSectionEdge>
	nodes: Array<ContentfulSection>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type ContentfulSectionSortInput = {
	fields?: Maybe<Array<Maybe<ContentfulSectionFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type ContentfulParagraphTextFilterInput = {
	raw?: Maybe<StringQueryOperatorInput>
}

export type ContentfulParagraphSysFilterInput = {
	type?: Maybe<StringQueryOperatorInput>
	revision?: Maybe<IntQueryOperatorInput>
	contentType?: Maybe<ContentfulParagraphSysContentTypeFilterInput>
}

export type ContentfulParagraphSysContentTypeFilterInput = {
	sys?: Maybe<ContentfulParagraphSysContentTypeSysFilterInput>
}

export type ContentfulParagraphSysContentTypeSysFilterInput = {
	type?: Maybe<StringQueryOperatorInput>
	linkType?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
}

export type ContentfulParagraphConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulParagraphEdge>
	nodes: Array<ContentfulParagraph>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<ContentfulParagraphGroupConnection>
}

export type ContentfulParagraphConnectionDistinctArgs = {
	field: ContentfulParagraphFieldsEnum
}

export type ContentfulParagraphConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: ContentfulParagraphFieldsEnum
}

export type ContentfulParagraphEdge = {
	next?: Maybe<ContentfulParagraph>
	node: ContentfulParagraph
	previous?: Maybe<ContentfulParagraph>
}

export type ContentfulParagraphFieldsEnum =
	| 'contentful_id'
	| 'id'
	| 'node_locale'
	| 'identifier'
	| 'text___raw'
	| 'imageType'
	| 'page'
	| 'page___contentful_id'
	| 'page___id'
	| 'page___node_locale'
	| 'page___title'
	| 'page___slug'
	| 'page___spaceId'
	| 'page___createdAt'
	| 'page___updatedAt'
	| 'page___sys___type'
	| 'page___sys___revision'
	| 'page___parent___id'
	| 'page___parent___parent___id'
	| 'page___parent___parent___children'
	| 'page___parent___children'
	| 'page___parent___children___id'
	| 'page___parent___children___children'
	| 'page___parent___internal___content'
	| 'page___parent___internal___contentDigest'
	| 'page___parent___internal___description'
	| 'page___parent___internal___fieldOwners'
	| 'page___parent___internal___ignoreType'
	| 'page___parent___internal___mediaType'
	| 'page___parent___internal___owner'
	| 'page___parent___internal___type'
	| 'page___children'
	| 'page___children___id'
	| 'page___children___parent___id'
	| 'page___children___parent___children'
	| 'page___children___children'
	| 'page___children___children___id'
	| 'page___children___children___children'
	| 'page___children___internal___content'
	| 'page___children___internal___contentDigest'
	| 'page___children___internal___description'
	| 'page___children___internal___fieldOwners'
	| 'page___children___internal___ignoreType'
	| 'page___children___internal___mediaType'
	| 'page___children___internal___owner'
	| 'page___children___internal___type'
	| 'page___internal___content'
	| 'page___internal___contentDigest'
	| 'page___internal___description'
	| 'page___internal___fieldOwners'
	| 'page___internal___ignoreType'
	| 'page___internal___mediaType'
	| 'page___internal___owner'
	| 'page___internal___type'
	| 'spaceId'
	| 'createdAt'
	| 'updatedAt'
	| 'sys___type'
	| 'sys___revision'
	| 'sys___contentType___sys___type'
	| 'sys___contentType___sys___linkType'
	| 'sys___contentType___sys___id'
	| 'image___contentful_id'
	| 'image___id'
	| 'image___spaceId'
	| 'image___createdAt'
	| 'image___updatedAt'
	| 'image___file___url'
	| 'image___file___details___size'
	| 'image___file___fileName'
	| 'image___file___contentType'
	| 'image___title'
	| 'image___description'
	| 'image___node_locale'
	| 'image___sys___type'
	| 'image___sys___revision'
	| 'image___fixed___base64'
	| 'image___fixed___tracedSVG'
	| 'image___fixed___aspectRatio'
	| 'image___fixed___width'
	| 'image___fixed___height'
	| 'image___fixed___src'
	| 'image___fixed___srcSet'
	| 'image___fixed___srcWebp'
	| 'image___fixed___srcSetWebp'
	| 'image___fluid___base64'
	| 'image___fluid___tracedSVG'
	| 'image___fluid___aspectRatio'
	| 'image___fluid___src'
	| 'image___fluid___srcSet'
	| 'image___fluid___srcWebp'
	| 'image___fluid___srcSetWebp'
	| 'image___fluid___sizes'
	| 'image___gatsbyImageData'
	| 'image___resize___base64'
	| 'image___resize___tracedSVG'
	| 'image___resize___src'
	| 'image___resize___width'
	| 'image___resize___height'
	| 'image___resize___aspectRatio'
	| 'image___parent___id'
	| 'image___parent___parent___id'
	| 'image___parent___parent___children'
	| 'image___parent___children'
	| 'image___parent___children___id'
	| 'image___parent___children___children'
	| 'image___parent___internal___content'
	| 'image___parent___internal___contentDigest'
	| 'image___parent___internal___description'
	| 'image___parent___internal___fieldOwners'
	| 'image___parent___internal___ignoreType'
	| 'image___parent___internal___mediaType'
	| 'image___parent___internal___owner'
	| 'image___parent___internal___type'
	| 'image___children'
	| 'image___children___id'
	| 'image___children___parent___id'
	| 'image___children___parent___children'
	| 'image___children___children'
	| 'image___children___children___id'
	| 'image___children___children___children'
	| 'image___children___internal___content'
	| 'image___children___internal___contentDigest'
	| 'image___children___internal___description'
	| 'image___children___internal___fieldOwners'
	| 'image___children___internal___ignoreType'
	| 'image___children___internal___mediaType'
	| 'image___children___internal___owner'
	| 'image___children___internal___type'
	| 'image___internal___content'
	| 'image___internal___contentDigest'
	| 'image___internal___description'
	| 'image___internal___fieldOwners'
	| 'image___internal___ignoreType'
	| 'image___internal___mediaType'
	| 'image___internal___owner'
	| 'image___internal___type'
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'

export type ContentfulParagraphGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulParagraphEdge>
	nodes: Array<ContentfulParagraph>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type ContentfulParagraphFilterInput = {
	contentful_id?: Maybe<StringQueryOperatorInput>
	id?: Maybe<StringQueryOperatorInput>
	node_locale?: Maybe<StringQueryOperatorInput>
	identifier?: Maybe<StringQueryOperatorInput>
	text?: Maybe<ContentfulParagraphTextFilterInput>
	imageType?: Maybe<StringQueryOperatorInput>
	page?: Maybe<ContentfulPageFilterListInput>
	spaceId?: Maybe<StringQueryOperatorInput>
	createdAt?: Maybe<DateQueryOperatorInput>
	updatedAt?: Maybe<DateQueryOperatorInput>
	sys?: Maybe<ContentfulParagraphSysFilterInput>
	image?: Maybe<ContentfulAssetFilterInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
}

export type ContentfulParagraphSortInput = {
	fields?: Maybe<Array<Maybe<ContentfulParagraphFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type ContentfulLinkIconTextNodeConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulLinkIconTextNodeEdge>
	nodes: Array<ContentfulLinkIconTextNode>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<ContentfulLinkIconTextNodeGroupConnection>
}

export type ContentfulLinkIconTextNodeConnectionDistinctArgs = {
	field: ContentfulLinkIconTextNodeFieldsEnum
}

export type ContentfulLinkIconTextNodeConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: ContentfulLinkIconTextNodeFieldsEnum
}

export type ContentfulLinkIconTextNodeEdge = {
	next?: Maybe<ContentfulLinkIconTextNode>
	node: ContentfulLinkIconTextNode
	previous?: Maybe<ContentfulLinkIconTextNode>
}

export type ContentfulLinkIconTextNodeFieldsEnum =
	| 'id'
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'
	| 'icon'
	| 'sys___type'

export type ContentfulLinkIconTextNodeGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulLinkIconTextNodeEdge>
	nodes: Array<ContentfulLinkIconTextNode>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type ContentfulLinkIconTextNodeSortInput = {
	fields?: Maybe<Array<Maybe<ContentfulLinkIconTextNodeFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type ContentfulContentTypeSysFilterInput = {
	type?: Maybe<StringQueryOperatorInput>
}

export type ContentfulContentTypeConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulContentTypeEdge>
	nodes: Array<ContentfulContentType>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<ContentfulContentTypeGroupConnection>
}

export type ContentfulContentTypeConnectionDistinctArgs = {
	field: ContentfulContentTypeFieldsEnum
}

export type ContentfulContentTypeConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: ContentfulContentTypeFieldsEnum
}

export type ContentfulContentTypeEdge = {
	next?: Maybe<ContentfulContentType>
	node: ContentfulContentType
	previous?: Maybe<ContentfulContentType>
}

export type ContentfulContentTypeFieldsEnum =
	| 'id'
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'
	| 'name'
	| 'displayField'
	| 'description'
	| 'sys___type'

export type ContentfulContentTypeGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<ContentfulContentTypeEdge>
	nodes: Array<ContentfulContentType>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type ContentfulContentTypeFilterInput = {
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
	name?: Maybe<StringQueryOperatorInput>
	displayField?: Maybe<StringQueryOperatorInput>
	description?: Maybe<StringQueryOperatorInput>
	sys?: Maybe<ContentfulContentTypeSysFilterInput>
}

export type ContentfulContentTypeSortInput = {
	fields?: Maybe<Array<Maybe<ContentfulContentTypeFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type SiteBuildMetadataConnection = {
	totalCount: Scalars['Int']
	edges: Array<SiteBuildMetadataEdge>
	nodes: Array<SiteBuildMetadata>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<SiteBuildMetadataGroupConnection>
}

export type SiteBuildMetadataConnectionDistinctArgs = {
	field: SiteBuildMetadataFieldsEnum
}

export type SiteBuildMetadataConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: SiteBuildMetadataFieldsEnum
}

export type SiteBuildMetadataEdge = {
	next?: Maybe<SiteBuildMetadata>
	node: SiteBuildMetadata
	previous?: Maybe<SiteBuildMetadata>
}

export type SiteBuildMetadataFieldsEnum =
	| 'id'
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'
	| 'buildTime'

export type SiteBuildMetadataGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<SiteBuildMetadataEdge>
	nodes: Array<SiteBuildMetadata>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type SiteBuildMetadataFilterInput = {
	id?: Maybe<StringQueryOperatorInput>
	parent?: Maybe<NodeFilterInput>
	children?: Maybe<NodeFilterListInput>
	internal?: Maybe<InternalFilterInput>
	buildTime?: Maybe<DateQueryOperatorInput>
}

export type SiteBuildMetadataSortInput = {
	fields?: Maybe<Array<Maybe<SiteBuildMetadataFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type SitePluginConnection = {
	totalCount: Scalars['Int']
	edges: Array<SitePluginEdge>
	nodes: Array<SitePlugin>
	pageInfo: PageInfo
	distinct: Array<Scalars['String']>
	group: Array<SitePluginGroupConnection>
}

export type SitePluginConnectionDistinctArgs = {
	field: SitePluginFieldsEnum
}

export type SitePluginConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>
	limit?: Maybe<Scalars['Int']>
	field: SitePluginFieldsEnum
}

export type SitePluginEdge = {
	next?: Maybe<SitePlugin>
	node: SitePlugin
	previous?: Maybe<SitePlugin>
}

export type SitePluginFieldsEnum =
	| 'id'
	| 'parent___id'
	| 'parent___parent___id'
	| 'parent___parent___parent___id'
	| 'parent___parent___parent___children'
	| 'parent___parent___children'
	| 'parent___parent___children___id'
	| 'parent___parent___children___children'
	| 'parent___parent___internal___content'
	| 'parent___parent___internal___contentDigest'
	| 'parent___parent___internal___description'
	| 'parent___parent___internal___fieldOwners'
	| 'parent___parent___internal___ignoreType'
	| 'parent___parent___internal___mediaType'
	| 'parent___parent___internal___owner'
	| 'parent___parent___internal___type'
	| 'parent___children'
	| 'parent___children___id'
	| 'parent___children___parent___id'
	| 'parent___children___parent___children'
	| 'parent___children___children'
	| 'parent___children___children___id'
	| 'parent___children___children___children'
	| 'parent___children___internal___content'
	| 'parent___children___internal___contentDigest'
	| 'parent___children___internal___description'
	| 'parent___children___internal___fieldOwners'
	| 'parent___children___internal___ignoreType'
	| 'parent___children___internal___mediaType'
	| 'parent___children___internal___owner'
	| 'parent___children___internal___type'
	| 'parent___internal___content'
	| 'parent___internal___contentDigest'
	| 'parent___internal___description'
	| 'parent___internal___fieldOwners'
	| 'parent___internal___ignoreType'
	| 'parent___internal___mediaType'
	| 'parent___internal___owner'
	| 'parent___internal___type'
	| 'children'
	| 'children___id'
	| 'children___parent___id'
	| 'children___parent___parent___id'
	| 'children___parent___parent___children'
	| 'children___parent___children'
	| 'children___parent___children___id'
	| 'children___parent___children___children'
	| 'children___parent___internal___content'
	| 'children___parent___internal___contentDigest'
	| 'children___parent___internal___description'
	| 'children___parent___internal___fieldOwners'
	| 'children___parent___internal___ignoreType'
	| 'children___parent___internal___mediaType'
	| 'children___parent___internal___owner'
	| 'children___parent___internal___type'
	| 'children___children'
	| 'children___children___id'
	| 'children___children___parent___id'
	| 'children___children___parent___children'
	| 'children___children___children'
	| 'children___children___children___id'
	| 'children___children___children___children'
	| 'children___children___internal___content'
	| 'children___children___internal___contentDigest'
	| 'children___children___internal___description'
	| 'children___children___internal___fieldOwners'
	| 'children___children___internal___ignoreType'
	| 'children___children___internal___mediaType'
	| 'children___children___internal___owner'
	| 'children___children___internal___type'
	| 'children___internal___content'
	| 'children___internal___contentDigest'
	| 'children___internal___description'
	| 'children___internal___fieldOwners'
	| 'children___internal___ignoreType'
	| 'children___internal___mediaType'
	| 'children___internal___owner'
	| 'children___internal___type'
	| 'internal___content'
	| 'internal___contentDigest'
	| 'internal___description'
	| 'internal___fieldOwners'
	| 'internal___ignoreType'
	| 'internal___mediaType'
	| 'internal___owner'
	| 'internal___type'
	| 'resolve'
	| 'name'
	| 'version'
	| 'pluginOptions___output'
	| 'pluginOptions___createLinkInHead'
	| 'pluginOptions___name'
	| 'pluginOptions___short_name'
	| 'pluginOptions___start_url'
	| 'pluginOptions___background_color'
	| 'pluginOptions___theme_color'
	| 'pluginOptions___display'
	| 'pluginOptions___icon'
	| 'pluginOptions___legacy'
	| 'pluginOptions___theme_color_in_head'
	| 'pluginOptions___cache_busting_mode'
	| 'pluginOptions___crossOrigin'
	| 'pluginOptions___include_favicon'
	| 'pluginOptions___cacheDigest'
	| 'pluginOptions___base64Width'
	| 'pluginOptions___stripMetadata'
	| 'pluginOptions___defaultQuality'
	| 'pluginOptions___failOnError'
	| 'pluginOptions___path'
	| 'pluginOptions___configDir'
	| 'pluginOptions___pathCheck'
	| 'pluginOptions___allExtensions'
	| 'pluginOptions___isTSX'
	| 'pluginOptions___jsxPragma'
	| 'pluginOptions___accessToken'
	| 'pluginOptions___spaceId'
	| 'pluginOptions___host'
	| 'pluginOptions___environment'
	| 'pluginOptions___downloadLocal'
	| 'pluginOptions___forceFullSync'
	| 'pluginOptions___pageLimit'
	| 'pluginOptions___assetDownloadWorkers'
	| 'pluginOptions___useNameForId'
	| 'nodeAPIs'
	| 'browserAPIs'
	| 'ssrAPIs'
	| 'pluginFilepath'
	| 'packageJson___name'
	| 'packageJson___description'
	| 'packageJson___version'
	| 'packageJson___main'
	| 'packageJson___author'
	| 'packageJson___license'
	| 'packageJson___dependencies'
	| 'packageJson___dependencies___name'
	| 'packageJson___dependencies___version'
	| 'packageJson___devDependencies'
	| 'packageJson___devDependencies___name'
	| 'packageJson___devDependencies___version'
	| 'packageJson___peerDependencies'
	| 'packageJson___peerDependencies___name'
	| 'packageJson___peerDependencies___version'
	| 'packageJson___keywords'

export type SitePluginGroupConnection = {
	totalCount: Scalars['Int']
	edges: Array<SitePluginEdge>
	nodes: Array<SitePlugin>
	pageInfo: PageInfo
	field: Scalars['String']
	fieldValue?: Maybe<Scalars['String']>
}

export type SitePluginSortInput = {
	fields?: Maybe<Array<Maybe<SitePluginFieldsEnum>>>
	order?: Maybe<Array<Maybe<SortOrderEnum>>>
}
