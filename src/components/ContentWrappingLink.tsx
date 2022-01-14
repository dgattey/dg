import type { Link as LinkProps } from 'api/contentful/generated/api.generated';
import NextLink from 'next/link';

type Props = Pick<React.ComponentProps<'div'>, 'children'> & {
  /**
   * The link whose URL we should render
   */
  link: LinkProps | undefined;
};

/**
 * Renders a link that wraps the given children. Compliant with Next's Link too.
 */
const ContentWrappingLink = ({ link, children }: Props) => {
  if (!link?.url) {
    return null;
  }
  return (
    <NextLink passHref href={link.url}>
      <a href={link.url}>{children}</a>
    </NextLink>
  );
};

export default ContentWrappingLink;
