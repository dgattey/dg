import useData from 'api/useData';
import Meta from 'components/Meta';

/**
 * Creates metadata for the privacy page from privacy data
 */
const HomepageMeta = () => {
  const { data: privacyBlock } = useData('privacy');

  // Grabs the second text element, since the first is a last updated
  const secondParagraph = privacyBlock?.content?.json.content?.filter(
    (item) => item.nodeType === 'paragraph',
  )?.[1];

  const text = secondParagraph?.content?.map((node) => node.value)?.join('') ?? '';

  return <Meta title="Engineer. Problem Solver." description={text} />;
};

export default HomepageMeta;
