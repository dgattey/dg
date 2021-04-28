import * as React from 'react'
import Image from './Image'
import RichText from './RichText'

/**
 * Top level page has a list of blocks we pass in to start the recursion
 */
type PageProps = {
	project: GatsbyTypes.ProjectFragment
}

/**
 * A project component to show the thumb + details about a project
 * @param props An object containing `PageProps`
 * @returns An element for the project as a wrapper
 */
const Project = ({ project }: PageProps): JSX.Element => {
	if (!project.title || !project.type || !project.thumbnail?.gatsbyImageData) {
		throw TypeError('Badly formatted project')
	}
	return (
		<>
			{project.title} | {project.creationDate} | {project.type} |{' '}
			<Image image={project.thumbnail} />
			<RichText richText={project.description} />
		</>
	)
}

export default Project
