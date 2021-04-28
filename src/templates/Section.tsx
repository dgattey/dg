import * as React from 'react'
import Link from './Link'

/**
 * This is the array of section type that is nested within BlockType
 */
type BlockArrayType = GatsbyTypes.Maybe<ReadonlyArray<BlockType>>

/**
 * This is the "input type" - all section types are possibly of this type, so make it recursive and type-safe!
 */
type BlockType = GatsbyTypes.Maybe<
	| GatsbyTypes.TextFragment
	| GatsbyTypes.LinkFragment
	| GatsbyTypes.ProjectFragment
	| (GatsbyTypes.SectionFragment & {
			blocks: BlockArrayType
	  })
>

/**
 * Top level page has a list of blocks we pass in to start the recursion
 */
type PageProps = {
	blocks: BlockArrayType
}

/**
 * @param item An optional block fragment
 * @returns The text fragment if it's really text
 */
const isTextFragment = (item: BlockType): item is GatsbyTypes.TextFragment =>
	item?.internal.type === 'ContentfulText'

/**
 * @param item An optional block fragment
 * @returns The link fragment if it's really a link
 */
const isLinkFragment = (item: BlockType): item is GatsbyTypes.LinkFragment =>
	item?.internal.type === 'ContentfulLink'

/**
 * @param item An optional block fragment
 * @returns The project fragment if it's really a project
 */
const isProjectFragment = (
	item: BlockType
): item is GatsbyTypes.ProjectFragment =>
	item?.internal.type === 'ContentfulProject'

/**
 * Creates an element from one block based on its internal type
 * @param block A block that may be almost anything
 * @returns An element to nest somewhere else
 */
const generateElement = (block: BlockType): JSX.Element => {
	if (!block) {
		throw TypeError("Section wasn't defined")
	}
	if (isTextFragment(block)) {
		return <p key={block.id}>{block.id}</p>
	} else if (isLinkFragment(block)) {
		return <Link key={block.id} link={block} />
	} else if (isProjectFragment(block)) {
		return <p key={block.id}>{block.title}</p>
	} else {
		return <Section key={block.id} blocks={block.blocks} />
	}
}

/**
 * A recursively-defined Section that can have a link, project, text, or another section within it.
 * @param props An object containing `PageProps`
 * @returns An element for the section as a list
 */
const Section = ({ blocks }: PageProps): JSX.Element => (
	<ul>
		{blocks?.map((block) => (
			<li key={block?.id}>{generateElement(block)}</li>
		))}
	</ul>
)

export default Section
