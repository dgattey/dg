import useData from 'api/useData';
import Meta from 'components/Meta';

/**
 * Creates metadata for the home page from intro data
 */
const HomepageMeta = () => {
  const { data: introBlock } = useData('introBlock');

  // Grabs the first text element, essentially.
  const firstParagraph =
    introBlock?.textBlock?.content?.json.content
      ?.find((item) => item.nodeType === 'paragraph')
      ?.content?.find((item) => item.nodeType === 'text')?.value ??
    "I'm Dylan, an engineer focused on building top-notch user experiences. I'm interested in React, sustainability, startups, music, and cycling.";

  return <Meta title="Engineer. Problem Solver." description={firstParagraph} />;
};

export default HomepageMeta;
