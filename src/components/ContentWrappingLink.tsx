import type { Link } from 'api/types/generated/contentfulApi.generated';
import NextLink from 'next/link';

type Props = Pick<React.ComponentProps<'div'>, 'children'> & {
  /**
   * The link whose URL we should render
   */
  link: Link | undefined;
};

/**
 * Renders a link that wraps the given children. Compliant with Next's Link too.
 */
export function ContentWrappingLink({ link, children }: Props) {
  if (!link?.url) {
    return null;
  }
  return (
    <NextLink href={link.url} target="_blank" rel="noreferrer">
      {children}
    </NextLink>
  );
}
