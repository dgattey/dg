import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import * as React from 'react'

/**
 * Shared type for raw text as it comes from Contentful
 */
export type RawRichText = GatsbyTypes.Maybe<
	Pick<GatsbyTypes.ContentfulTextText, 'raw'>
>

/**
 * All we need is rich text to display this element
 */
type PropTypes = {
	richText: RawRichText
}

/**
 * A rich text paragraph using the default settings to render the elements because it's
 * really tough to set up elements that work right for custom elements.
 * See https://www.contentful.com/developers/docs/concepts/rich-text/
 * @param props An object containing `PropTypes`
 * @returns An element for the rich text, composed of other items inside it
 */
const RichText = ({ richText }: PropTypes): JSX.Element => {
	if (!richText || !richText?.raw) {
		throw TypeError('Malformed rich text')
	}
	return <>{documentToReactComponents(JSON.parse(richText.raw))}</>
}

export default RichText
