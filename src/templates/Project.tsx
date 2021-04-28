import * as React from 'react'
import RichTextParagraph from './RichTextParagraph'

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
	if (!project.title || !project.type) {
		throw TypeError('Badly formatted project')
	}
	return (
		<>
			{project.title} | {project.creationDate} | {project.type} |{' '}
			{project.thumbnail?.id}
			<RichTextParagraph richText={project.description} />
		</>
	)
}

export default Project
