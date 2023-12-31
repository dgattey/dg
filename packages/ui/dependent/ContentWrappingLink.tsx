import type { Link as LinkType } from 'api/contentful/api.generated';
import type { SxProps } from '../theme';
import { Link } from './Link';

type ContentWrappingLinkProps = Pick<React.ComponentProps<'div'>, 'children'> & {
  /**
   * The link whose URL we should render
   */
  link: LinkType | undefined;

  sx?: SxProps;
};

/**
 * Renders a link that wraps the given children. Compliant with Next's Link too.
 */
export function ContentWrappingLink({ link, children, sx }: ContentWrappingLinkProps) {
  if (!link?.url) {
    return null;
  }
  return (
    <Link href={link.url} isExternal sx={sx}>
      {children}
    </Link>
  );
}
