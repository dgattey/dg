import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image'
import * as React from 'react'

/**
 * Shared type to describe what image data looks like coming from Contentful. Note that because Scalars[JSON]
 * is defined as `never`, the type of Pick<... 'gatsbyImageData'> is undefined and I need a separate type
 */
export type RawImageData = GatsbyTypes.Maybe<
	Pick<
		GatsbyTypes.ContentfulAsset,
		'id' | 'title' | 'gatsbyImageData' | 'description'
	>
>

/**
 * Internal type to describe what image data looks like coming from Contentful with a transformation applied
 * manually. Note that because Scalars[JSON] is defined as `never`, this separate type is necessary.
 */
type ImageData = GatsbyTypes.Maybe<
	Pick<GatsbyTypes.ContentfulAsset, 'id' | 'title' | 'description'> & {
		gatsbyImageData: IGatsbyImageData
	}
>

/**
 * Just image data + alt text that we need
 */
type PropTypes = {
	image: RawImageData
}

/**
 * A simple image using the gatsby image data passed to it
 * @param props An object containing `PropTypes`
 * @returns An element for the image and all associated content
 */
const Image = ({ image }: PropTypes): JSX.Element => {
	const typedImageData = (image as ImageData)?.gatsbyImageData
	if (!image || !typedImageData?.images.sources) {
		throw TypeError('Malformed image data')
	}
	return (
		<GatsbyImage
			image={typedImageData}
			alt={image.description ?? image.title ?? image.id}
		/>
	)
}

export default Image
