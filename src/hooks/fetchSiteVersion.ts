import { graphql, useStaticQuery } from 'gatsby'

/**
 * Fetches the latest version of the site locally using git (latest tag)
 *
 * @return  {GatsbyTypes.SiteVersionQuery}  The latest version of the site
 */
export const fetchSiteVersion = (): GatsbyTypes.SiteVersionQuery =>
	useStaticQuery<GatsbyTypes.SiteVersionQuery>(graphql`
		query SiteVersion {
			gitTag(latest: { eq: true }) {
				name
			}
		}
	`)
