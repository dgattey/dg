import type { Project } from '@dg/api/types/generated/contentfulApi.generated';
import { Globe, Monitor, Smartphone } from 'lucide-react';

type Props = Pick<Project, 'type'>;

/**
 * Returns a Feather icon matching a project type or null
 */
const ProjectIcon = ({
  type,
  className,
}: Props & Pick<React.ComponentProps<'div'>, 'className'>) => {
  if (!type?.[0]) {
    throw new TypeError('Invalid type for project');
  }
  switch (type[0]) {
    case 'Website':
      return <Globe size="1em" className={className} />;
    case 'iOS App':
      return <Smartphone size="1em" className={className} />;
    case 'macOS App':
      return <Monitor size="1em" className={className} />;
    default:
      return null;
  }
};

export default ProjectIcon;
