import { graphql } from 'gatsby'
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
 * All type definitions for a page object
 */
type PageProps = {
	pageContext: {
		id: string
	}
	data: GatsbyTypes.PageQuery
}

/**
 * Fetches data for a page - this fetches section data up to three layers deep.
 */
export const query = graphql`
	fragment Text on ContentfulText {
		id
		imageType
		text {
			raw
		}
	}

	fragment Section on ContentfulSection {
		id
		title
	}

	fragment Project on ContentfulProject {
		id
		title
		creationDate
		description {
			raw
		}
		type
		thumbnail {
			id
		}
	}

	fragment Link on ContentfulLink {
		title
		url
	}

	query Page($id: String) {
		contentfulPage(id: { eq: $id }) {
			title
			sections {
				... on ContentfulSection {
					...Section
					blocks {
						... on ContentfulProject {
							...Project
						}
						... on ContentfulLink {
							...Link
						}
						... on ContentfulSection {
							...Section
							blocks {
								... on ContentfulProject {
									...Project
								}
								... on ContentfulLink {
									...Link
								}
								... on ContentfulSection {
									...Section
									blocks {
										... on ContentfulProject {
											...Project
										}
										... on ContentfulLink {
											...Link
										}
									}
								}
							}
						}
					}
				}
				... on ContentfulText {
					...Text
				}
			}
		}
	}
`

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
