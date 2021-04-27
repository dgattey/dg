import { graphql, useStaticQuery } from 'gatsby'

/**
 * Fetches header data when needed and returns it as a header query
 *
 * @return  {GatsbyTypes.FooterQuery}  The return value of the header query
 */
export const fetchFooter = (): GatsbyTypes.FooterQuery =>
	useStaticQuery<GatsbyTypes.FooterQuery>(graphql`
		query Footer {
			allContentfulSection(filter: { title: { eq: "Footer" } }) {
				edges {
					node {
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
		}
	`)
