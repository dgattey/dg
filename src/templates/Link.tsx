import { Link as GatsbyLink } from 'gatsby'
import React from 'react'

/**
 * Defines link data for use in-app from Contentful types
 */
export type LinkData = GatsbyTypes.Maybe<
	Pick<GatsbyTypes.ContentfulLink, 'title' | 'url'>
>

/**
 * @param url A string based url
 * @returns If the url has an external scheme (http/https/mailto)
 */
export const isExternal = (url: string): boolean =>
	['mailto:', 'https://', 'http://'].some((scheme) => url.startsWith(scheme))

interface Props {
	readonly link: LinkData
}

/**
 * Generates a singular link element from a ContentfulLink with only title/url
 * @param param0 A well-formed object that contains a link at minimum
 * @returns A JSX element for the full link combo
 */
const Link = ({ link }: Props): JSX.Element => {
	if (!link?.title || !link?.url) {
		throw TypeError('Missing required fields!')
	}

	// Mail/external links need to use a regular <a> element, not Link
	if (isExternal(link.url)) {
		return (
			<a href={link.url} target='_blank' rel='noreferrer'>
				{link.title}
			</a>
		)
	}
	return (
		<GatsbyLink key={link.title} to={link.url}>
			{link.title}
		</GatsbyLink>
	)
}

export default Link
