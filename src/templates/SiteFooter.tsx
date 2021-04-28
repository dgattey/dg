import React from 'react'
import { fetchFooter } from '../hooks/fetchFooter'
import { fetchSiteVersion } from '../hooks/fetchSiteVersion'
import Link, { LinkData } from './Link'
import SVGIconLink, { SVGIconLinkData } from './SVGIconLink'

const footerStyles = {
	marginTop: 0,
	marginBottom: 64,
	maxWidth: 320,
	color: '#232129',
	fontFamily: '-apple-system, Roboto, sans-serif, serif',
}

/**
 * Unfortunately the Contentful Footer section type is terrible. This pulls out
 * the ContentfulSection type that's been destructured into its own type for use
 * when creating arrays, otherwise the full gamut of ContentefulSection is
 * available, and that's not true.
 */
type SectionArray = ReadonlyArray<{
	readonly blocks: GatsbyTypes.Maybe<ReadonlyArray<SVGIconLinkData>>
}>

/**
 * Unfortunately the Contentful Footer section type is terrible. This pulls out
 * the ContentfulLink type array into its own type as well.
 */
type LinkArray = ReadonlyArray<LinkData>

/**
 * The site footer, with copyright + icon links at right
 */
const SiteFooter = (): JSX.Element => {
	const version = fetchSiteVersion()

	// Separates footer data into text links and icon links
	const footerData =
		fetchFooter().allContentfulSection.edges[0]?.node.blocks ?? []

	const textLinks = (footerData.filter(
		(data) => (data as GatsbyTypes.ContentfulLink)?.url !== undefined
	) as LinkArray).map((link) => <Link key={link?.title} link={link} />)

	const iconLinks = (footerData.filter(
		(data) => (data as GatsbyTypes.ContentfulSection)?.blocks !== undefined
	) as SectionArray).map((section) =>
		section.blocks?.map((link) => <SVGIconLink key={link?.title} link={link} />)
	)

	// We should only have one node to represent the footer section

	return (
		<footer style={footerStyles}>
			<p>
				© {new Date().getFullYear()} Dylan Gattey | {version} | {textLinks}
				{iconLinks}
			</p>
		</footer>
	)
}

export default SiteFooter
