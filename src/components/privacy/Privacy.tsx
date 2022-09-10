import useData from '@dg/api/useData';
import Meta from '@dg/components/Meta';
import RichText from '@dg/components/RichText';
import type { Page } from '@dg/types/Page';
import styled from 'styled-components';

const SingleColumn = styled(RichText)`
  max-width: 35em;
  margin-left: auto;
  margin-right: auto;
`;

/**
 * Shows the privacy policy on a page alone
 */
const Privacy = ({ pageUrl }: Pick<Page, 'pageUrl'>) => {
  const { data: privacyTextBlock } = useData('privacy');
  if (!privacyTextBlock?.content) {
    return null;
  }

  // Grabs the second text element, since the first is a last updated
  const secondParagraph = privacyTextBlock?.content?.json.content?.filter(
    (item) => item.nodeType === 'paragraph',
  )?.[1];
  const privacyDescription = secondParagraph?.content?.map((node) => node.value)?.join('');

  return (
    <>
      <Meta pageUrl={pageUrl} title="Privacy Policy" description={privacyDescription} />
      <SingleColumn {...privacyTextBlock.content} />
    </>
  );
};

export default Privacy;
