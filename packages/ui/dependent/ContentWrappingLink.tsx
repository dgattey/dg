import type { Link as LinkType } from '@dg/services/contentful/api.generated';
import { Link } from './Link';

type ContentWrappingLinkProps = Pick<React.ComponentProps<'div'>, 'children'> & {
  /**
   * The link whose URL we should render
   */
  link: LinkType | undefined;
};

/**
 * Renders a link that wraps the given children. Server component compatible.
 */
export function ContentWrappingLink({ link, children }: ContentWrappingLinkProps) {
  if (!link?.url) {
    return null;
  }
  return (
    <Link
      href={link.url}
      isExternal={true}
      sx={{
        borderRadius: 'inherit',
        color: 'inherit',
        display: 'block',
        height: '100%',
        textDecoration: 'none',
      }}
      title={link.title ?? undefined}
    >
      {children}
    </Link>
  );
}
