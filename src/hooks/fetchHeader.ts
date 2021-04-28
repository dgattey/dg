import { graphql, useStaticQuery } from 'gatsby'

/**
 * Fetches the section corresponding to the header and finds the nodes within it
 * to transform into links
 *
 * @return  {GatsbyTypes.HeaderQuery}  nodes with blocks of links
 */
export const fetchHeader = (): GatsbyTypes.HeaderQuery =>
	useStaticQuery<GatsbyTypes.HeaderQuery>(graphql`
		query Header {
			allContentfulSection(filter: { title: { eq: "Header" } }) {
				nodes {
					blocks {
						... on ContentfulLink {
							title
							url
						}
					}
				}
			}
		}
	`)
