import { graphql, useStaticQuery } from 'gatsby'

/**
 * Fetches the section corresponding to the footer and finds the nodes within it
 * to transform into sections and links
 *
 * @return  {GatsbyTypes.FooterQuery}  nodes with blocks of Links or Sections
 */
export const fetchFooter = (): GatsbyTypes.FooterQuery =>
	useStaticQuery<GatsbyTypes.FooterQuery>(graphql`
		query Footer {
			allContentfulSection(filter: { title: { eq: "Footer" } }) {
				nodes {
					blocks {
						... on ContentfulLink {
							title
							url
						}
						... on ContentfulSection {
							blocks {
								... on ContentfulLink {
									url
									title
									icon {
										icon
									}
								}
							}
						}
					}
				}
			}
		}
	`)
