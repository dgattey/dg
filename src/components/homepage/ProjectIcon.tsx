import type { Project } from 'api/types/generated/contentfulApi.generated';
import { FiGlobe, FiMonitor, FiSmartphone } from 'react-icons/fi';

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
      return <FiGlobe className={className} />;
    case 'iOS App':
      return <FiSmartphone className={className} />;
    case 'macOS App':
      return <FiMonitor className={className} />;
    default:
      return null;
  }
};

export default ProjectIcon;
