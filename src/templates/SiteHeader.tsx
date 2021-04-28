import React from 'react'
import { fetchHeader } from '../hooks/fetchHeader'
import LinkListItem from './LinkListItem'

const headingStyles = {
	marginTop: 0,
	marginBottom: 64,
	maxWidth: 320,
	color: '#232129',
	fontFamily: '-apple-system, Roboto, sans-serif, serif',
}

/**
 * Fetches the header links and creates elements for them
 * @returns An array of JSX elements for the header links
 */
const generateLinkElements = () => {
	const headerData = fetchHeader()
	return headerData.allContentfulSection.nodes
		.flatMap((node) => node.blocks)
		.map((link) => <LinkListItem key={link?.title} link={link} />)
}

/**
 * The site header, with logo + links to all pages in the header object
 */
const SiteHeader = (): JSX.Element => (
	<nav style={headingStyles}>
		<ul>
			<LinkListItem link={{ title: 'dg.', url: '/' }} />
			{generateLinkElements()}
		</ul>
	</nav>
)

export default SiteHeader
