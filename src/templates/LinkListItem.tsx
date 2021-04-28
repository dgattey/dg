import React from 'react'
import Link, { LinkData } from './Link'

interface Props {
	readonly link: LinkData
}

/**
 * Generates a singular link element that's wrapped in a list item for
 * use in navigation/etc
 * @param param0 A well-formed object that contains a link at minimum
 * @returns A JSX element for the full link combo
 */
const LinkListItem = ({ link }: Props): JSX.Element => {
	if (!link?.title || !link?.url) {
		throw TypeError('Missing required fields!')
	}
	return (
		<li key={link.title}>
			<Link link={link} />
		</li>
	)
}

export default LinkListItem
