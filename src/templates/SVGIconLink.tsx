import { Link as GatsbyLink } from 'gatsby'
import React from 'react'
import { isExternal } from './Link'

/**
 * Defines an SVG Icon Link's data, with icon in nested object
 */
export type SVGIconLinkData = GatsbyTypes.Maybe<
	Pick<GatsbyTypes.ContentfulLink, 'url' | 'title'> & {
		readonly icon: GatsbyTypes.Maybe<
			Pick<GatsbyTypes.contentfulLinkIconTextNode, 'icon'>
		>
	}
>

interface Props {
	readonly link: SVGIconLinkData
}

/**
 * Generates a singular link element that has an SVG element as its main target
 * @param param0 A well-formed object that contains a link at minimum
 * @returns A JSX element for the full link combo
 */
const SVGIconLink = ({ link }: Props): JSX.Element => {
	if (!link?.title || !link?.url || !link?.icon?.icon) {
		throw TypeError('Missing required fields!')
	}
	const svg = <img src={`data:image/svg+xml;utf8,${link.icon.icon}`} />

	// Mail/external links need to use a regular <a> element, not Link
	if (isExternal(link.url)) {
		return (
			<a
				href={link.url}
				aria-label={link.title}
				target='_blank'
				rel='noreferrer'
			>
				{svg}
			</a>
		)
	}
	return (
		<GatsbyLink key={link.title} to={link.url} aria-label={link.title}>
			{svg}
		</GatsbyLink>
	)
}

export default SVGIconLink
