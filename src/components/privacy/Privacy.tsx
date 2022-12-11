import { useData } from 'api/useData';
import { Meta } from 'components/Meta';
import { RichText } from 'components/RichText';

/**
 * Shows the privacy policy on a page alone
 */
export function Privacy() {
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
      <Meta title="Privacy Policy" description={privacyDescription} />
      <RichText
        sx={{
          maxWidth: '35em',
          marginX: 'auto',
        }}
        {...privacyTextBlock.content}
      />
    </>
  );
}
