import { graphql, useStaticQuery } from 'gatsby'

/**
 * Fetches header data when needed and returns it as a header query
 *
 * @return  {GatsbyTypes.HeaderQuery}  The return value of the header query
 */
export const fetchHeader = (): GatsbyTypes.HeaderQuery =>
	useStaticQuery<GatsbyTypes.HeaderQuery>(graphql`
		query Header {
			allContentfulSection(filter: { title: { eq: "Header" } }) {
				edges {
					node {
						blocks {
							... on ContentfulLink {
								title
								url
							}
						}
					}
				}
			}
		}
	`)
