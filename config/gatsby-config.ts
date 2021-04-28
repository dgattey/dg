import { config as environmentConfig } from 'dotenv'
import { GatsbyConfig } from 'gatsby'

// Make sure we can use environment variables from the env file
environmentConfig({ path: `.env.${process.env.NODE_ENV}` })

const siteMetadata = {
	title: 'Dylan Gattey',
	description: `Developer, designer, human.`,
	author: `@dgattey`,
	siteUrl: 'https://dylangattey.com',
}

const plugins = [
	{
		resolve: 'gatsby-source-contentful',
		options: {
			accessToken: process.env.CONTENTFUL_TOKEN,
			spaceId: process.env.CONTENTFUL_SPACE_ID,
			host: process.env.CONTENTFUL_HOST ?? `cdn.contentful.com`,
			useNameForId: false,
		},
	},
	{
		resolve: `gatsby-source-github-api`,
		options: {
			token: process.env.GITHUB_AUTHENTICATION_TOKEN,
			variables: {},
			graphQLQuery: `{
				repository(name: "dg", owner: "dgattey") {
					refs(refPrefix: "refs/tags/", last: 10) {
						nodes {
							name
							target {
								oid
							}
						}
					}
				}
			}`,
		},
	},
	'gatsby-plugin-sass',
	'gatsby-plugin-image',
	'gatsby-plugin-react-helmet',
	'gatsby-plugin-sitemap',
	{
		resolve: 'gatsby-plugin-manifest',
		options: {
			name: `dylan-gattey`,
			short_name: `dg`,
			start_url: `/`,
			background_color: `#663399`,
			theme_color: `#663399`,
			display: `minimal-ui`,
			icon: 'src/images/icon.png',
		},
	},
	'gatsby-plugin-sharp',
	'gatsby-transformer-sharp',
	{
		resolve: 'gatsby-source-filesystem',
		options: {
			name: 'images',
			path: 'src/images/',
		},
		__key: 'images',
	},
	'gatsby-plugin-offline',
	{
		resolve: `gatsby-plugin-typegen`,
		options: {
			outputPath: `src/__generated__/gatsby-types.d.ts`,
		},
	},
]

export default { siteMetadata, plugins } as GatsbyConfig
