import type { SxProps } from 'ui/theme';
import type { Link as LinkType } from 'api/server/contentful/api.generated';
import { Link } from 'components/Link';

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
