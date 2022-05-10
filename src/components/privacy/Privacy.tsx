import useData from 'api/useData';
import RichText from 'components/RichText';
import React from 'react';
import styled from 'styled-components';
import PrivacyMeta from './PrivacyMeta';

const SingleColumn = styled(RichText)`
  max-width: 35em;
  margin-left: auto;
  margin-right: auto;
`;

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
      <SingleColumn {...privacyTextBlock.content} />
    </>
  );
};

export default Privacy;
