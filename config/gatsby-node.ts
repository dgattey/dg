import { config as environmentConfig } from 'dotenv'
import { CreatePagesArgs, GatsbyConfig } from 'gatsby'

// Make sure we can use environment variables from the env file
environmentConfig({ path: `.env.${process.env.NODE_ENV}` })

/**
 * Represents a result of the AllPages query for all contentful pages
 */
type AllPagesResult = {
	errors?: Error
	data?: GatsbyTypes.Query
}

/**
 * Pulls all pages from contentful and creates individual pages using the page.tsx template for each one.
 * Passes the id to the template and associates the slug with the id.
 *
 * @return  {Promise<void>}  A function that creates pages
 */
const createPages = async ({
	graphql,
	actions: { createPage },
}: CreatePagesArgs): Promise<void> => {
	const pageTemplate = require.resolve(`../src/templates/page.tsx`)
	const { errors, data }: AllPagesResult = await graphql(`
		query AllPages {
			allContentfulPage {
				edges {
					node {
						id
						slug
					}
				}
			}
		}
	`)
	if (errors) {
		throw errors
	}

	// Create an actual page for this edge using the given slug - passing the id for later queries
	data?.allContentfulPage.edges.forEach((edge) => {
		createPage({
			path: `${edge.node.slug}`,
			component: pageTemplate,
			context: {
				id: edge.node.id,
			},
		})
	})
}

export default { createPages } as GatsbyConfig
