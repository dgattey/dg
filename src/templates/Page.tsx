import * as React from 'react'
import SiteFooter from './SiteFooter'
import SiteHeader from './SiteHeader'

// styles
const pageStyles = {
	color: '#232129',
	padding: 96,
	fontFamily: '-apple-system, Roboto, sans-serif, serif',
}
const headingStyles = {
	marginTop: 0,
	marginBottom: 64,
	maxWidth: 320,
}

/**
 * All type definitions for a page object (TODO: this component fetches more data)
 */
type PageProps = {
	pageContext: {
		id: string
	}
}

/**
 * A generic render of a page type object, with footer + navigation + content
 * @param props An object containing `PageProps`
 * @returns A React.FunctionalComponent for the page itself
 */
const Page = ({ pageContext: { id } }: PageProps): JSX.Element => (
	<>
		<header>
			<title>{id}</title>
			<SiteHeader />
		</header>
		<main style={pageStyles}>
			<h1 style={headingStyles}>{id}</h1>
		</main>
		<SiteFooter />
	</>
)

export default Page
