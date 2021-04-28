import { graphql, useStaticQuery } from 'gatsby'

/**
 * Fetches a version of the site from the Github data. Falls back to
 * 'v0.0.1' if necessary.
 *
 * @return  {string}  The latest version of the site as a string
 */
export const fetchSiteVersion = (): string => {
	const allVersions = useStaticQuery<GatsbyTypes.SiteVersionQuery>(graphql`
		query SiteVersion {
			githubData {
				data {
					repository {
						refs {
							nodes {
								name
								target {
									oid
								}
							}
						}
					}
				}
			}
		}
	`)
	const node = allVersions.githubData?.data?.repository?.refs?.nodes?.find(
		(item) => item?.target?.oid === process.env.GATSBY_VERCEL_GIT_COMMIT_SHA
	)
	return node?.name ?? 'v0.0.1'
}
