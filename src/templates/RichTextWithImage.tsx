import * as React from 'react'
import Image, { RawImageData } from './Image'
import RichText, { RawRichText } from './RichText'

/**
 * Shared type for raw image type without yet being an enum
 */
type ImageTypeData = GatsbyTypes.Maybe<string>

/**
 * Describes the supported values for image placement. If not one of these, either
 * we need to support a new value or the existing data is incorrect.
 */
enum ImagePlacement {
	None = 'none',
	Left = 'left',
	Right = 'right',
}

/**
 * Rich text, image data, and information about how to position that image
 */
type PropTypes = {
	richText: RawRichText
	imageType: ImageTypeData
	image: RawImageData
}

/**
 * A rich text paragraph using the default settings to render the elements because it's
 * really tough to set up elements that work right for custom elements.
 * See https://www.contentful.com/developers/docs/concepts/rich-text/
 * @param props An object containing `PropTypes`
 * @returns An element for the rich text, composed of other items inside it
 */
const RichTextWithImage = ({
	richText,
	image,
	imageType,
}: PropTypes): JSX.Element => {
	const placement = imageType as ImagePlacement
	if (!richText || !imageType || !placement) {
		throw TypeError('Malformed rich text with image data')
	}
	const textElement = () => <RichText richText={richText} />
	const imageElement = () => <Image image={image} />
	switch (placement) {
		case ImagePlacement.None:
			return <>{textElement()}</>
		case ImagePlacement.Left:
			return (
				<>
					{imageElement()}
					{textElement()}
				</>
			)
		case ImagePlacement.Right:
			return (
				<>
					{textElement()}
					{imageElement()}
				</>
			)
	}
}

export default RichTextWithImage
