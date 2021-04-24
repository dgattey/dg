import { config as environmentConfig } from 'dotenv'

// Make sure we can use environment variables from the env file
environmentConfig({ path: `.env.${process.env.NODE_ENV}` })

export const siteMetadata = {
	title: 'Dylan Gattey',
	description: `Developer, designer, human.`,
	author: `@dgattey`,
}

export const plugins = [
	{
		resolve: 'gatsby-source-contentful',
		options: {
			accessToken: process.env.CONTENTFUL_TOKEN,
			spaceId: process.env.CONTENTFUL_SPACE_ID,
			host:
				process.env.NODE_ENV == 'development'
					? `preview.contentful.com`
					: `cdn.contentful.com`,
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
			path: './src/images/',
		},
		__key: 'images',
	},
	'gatsby-plugin-offline',
]
