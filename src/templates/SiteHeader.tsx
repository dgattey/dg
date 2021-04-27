import { Link } from 'gatsby'
import React from 'react'
import { fetchHeader } from '../hooks/fetchHeader'

const headingStyles = {
	marginTop: 0,
	marginBottom: 64,
	maxWidth: 320,
	color: '#232129',
	fontFamily: '-apple-system, Roboto, sans-serif, serif',
}

/**
 * Generates a singular link element wrapped in a list item
 * @param param0 A well-formed ContentfulLink
 * @returns A JSX element for the full link combo
 */
const generateLinkElement = (
	link: GatsbyTypes.Maybe<Pick<GatsbyTypes.ContentfulLink, 'title' | 'url'>>
) => {
	if (!link?.title || !link?.url) {
		throw TypeError('Missing required fields!')
	}
	return (
		<li key={link.title}>
			<Link key={link.title} to={link.url}>
				{link.title}
			</Link>
		</li>
	)
}

/**
 * Fetches the header links and creates elements for them
 * @returns An array of JSX elements for the header links
 */
const generateLinkElements = () => {
	const headerData = fetchHeader()

	// Condense the all top level nodes down to the contents of the blocks (id and title)
	const links = headerData.allContentfulSection.edges.flatMap(
		(edge) => edge.node.blocks
	)
	return links.flatMap(generateLinkElement)
}

/**
 * The site header, with logo + links to all pages in the header object
 */
const SiteHeader = (): JSX.Element => (
	<nav style={headingStyles}>
		<ul>
			{/* Logo is separate from the rest */}
			{generateLinkElement({ title: 'dg.', url: '/' })}
			{generateLinkElements()}
		</ul>
	</nav>
)

export default SiteHeader
