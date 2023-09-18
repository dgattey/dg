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
  const secondParagraph = privacyTextBlock.content.json.content?.filter(
    (item) => item.nodeType === 'paragraph',
  )?.[1];
  const privacyDescription = secondParagraph?.content?.map((node) => node.value)?.join('');

  return (
    <>
      <Meta description={privacyDescription} title="Privacy Policy" />
      <RichText
        {...privacyTextBlock.content}
        sx={(theme) => ({
          marginTop: -6,
          maxWidth: '100%',
          marginX: 'auto',
          [theme.breakpoints.up('md')]: {
            maxWidth: '35em',
            marginTop: 0,
          },
        })}
      />
    </>
  );
}
