import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import * as React from 'react'

type PropTypes = {
	richText: GatsbyTypes.Maybe<Pick<GatsbyTypes.ContentfulTextText, 'raw'>>
}

/**
 * A rich text paragraph using the default settings to render the elements because it's
 * really tough to set up elements that work right for custom elements.
 * See https://www.contentful.com/developers/docs/concepts/rich-text/
 * @param props An object containing `PropTypes`
 * @returns An element for the rich text, composed of other items inside it
 */
const RichTextParagraph = ({ richText }: PropTypes): JSX.Element => {
	if (!richText || !richText?.raw) {
		throw TypeError('Malformed rich text')
	}
	return <>{documentToReactComponents(JSON.parse(richText.raw))}</>
}

export default RichTextParagraph
