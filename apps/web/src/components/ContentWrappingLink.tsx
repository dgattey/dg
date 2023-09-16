import type { Link as LinkType } from 'api/types/generated/contentfulApi.generated';
import { Link } from 'components/Link';
import { SxProps } from 'ui/theme';

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
    <Link isExternal href={link.url} sx={sx}>
      {children}
    </Link>
  );
}
