import { Link as LinkProps } from 'api/contentful/generated/api.generated';
import NextLink from 'next/link';
import styled from 'styled-components';

type Props = LinkProps;

const IconLink = styled.a``;

/**
 * Renders a link component from Contentful
 */
const Link = ({ title, url, icon }: Props) => {
  if (!url) {
    return null;
  }
  return icon ? (
    <NextLink href={url} passHref>
      <IconLink dangerouslySetInnerHTML={{ __html: icon }} />
    </NextLink>
  ) : (
    <NextLink href={url}>{title}</NextLink>
  );
};

export default Link;
