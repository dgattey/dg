import type { IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  icon: IconDefinition;
  size?: string;
}

/**
 * Creates a standard-sized font awesome icon
 */
export function FaIcon({ icon, size = '1em' }: Props) {
  return (
    <FontAwesomeIcon
      width={size}
      height={size}
      icon={icon}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
