import useData from 'api/useData';
import RichText from 'components/RichText';
import React from 'react';
import PrivacyMeta from './PrivacyMeta';

/**
 * Shows the privacy policy on a page alone
 */
const Privacy = () => {
  const { data: privacyTextBlock } = useData('privacy');
  if (!privacyTextBlock?.content) {
    return null;
  }

  return (
    <>
      <PrivacyMeta />
      <RichText {...privacyTextBlock.content} />
    </>
  );
};

export default Privacy;
