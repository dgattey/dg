import type { IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box } from '@mui/material';

type FaIconProps = {
  icon: IconDefinition;
  size?: string;
};

/**
 * Creates a standard-sized font awesome icon
 */
export function FaIcon({ icon, size = '1em' }: FaIconProps) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', height: size, width: size }}>
      <FontAwesomeIcon height={size} icon={icon} width={size} />
    </Box>
  );
}
