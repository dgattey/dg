import { useData } from 'api/useData';
import { Meta } from 'components/Meta';
import { RichText } from 'components/RichText';
import styled from '@emotion/styled';

type PrivacyProps = {
  pageUrl: string;
};

const SingleColumn = styled(RichText)`
  max-width: 35em;
  margin-left: auto;
  margin-right: auto;
`;

/**
 * Shows the privacy policy on a page alone
 */
export function Privacy({ pageUrl }: PrivacyProps) {
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
}
