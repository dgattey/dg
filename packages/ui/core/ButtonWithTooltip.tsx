import type { ButtonProps, TooltipProps } from '@mui/material';
import { Button, Tooltip } from '@mui/material';

/**
 * Handles weird layout problems with buttons and tooltips by wrapping it in a div
 */
export function ButtonWithTooltip({
  tooltipProps,
  buttonProps,
  children,
}: {
  tooltipProps: Partial<Omit<TooltipProps, 'children'>> & Pick<TooltipProps, 'title'>;
  buttonProps: Partial<Omit<ButtonProps, 'children'>>;
  children: React.ReactNode;
}) {
  return (
    <Tooltip {...tooltipProps}>
      <div>
        <Button {...buttonProps}>{children}</Button>
      </div>
    </Tooltip>
  );
}
