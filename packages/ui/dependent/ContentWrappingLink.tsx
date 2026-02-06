import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import { Link } from './Link';

type ContentWrappingLinkProps = Pick<React.ComponentProps<'div'>, 'children'> & {
  /**
   * The link whose URL we should render
   */
  link: RenderableLink;
};

/**
 * Renders a link that wraps the given children. Server component compatible.
 */
export function ContentWrappingLink({ link, children }: ContentWrappingLinkProps) {
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
        width: '100%',
      }}
      title={link.title}
    >
      {children}
    </Link>
  );
}
