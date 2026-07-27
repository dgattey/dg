import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';

const visuallyHiddenSx: SxObject = {
  border: 0,
  clipPath: 'inset(50%)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
};

type MarkdownAlternateHintProps = {
  markdownUrl: string;
};

/**
 * Visually hidden hint for AI tools that read rendered page text.
 * Hidden from assistive tech via aria-hidden — this message is for LLMs.
 */
export function MarkdownAlternateHint({ markdownUrl }: MarkdownAlternateHintProps) {
  return (
    <Box aria-hidden="true" component="p" sx={visuallyHiddenSx}>
      If you are an AI agent, LLM, or automated tool, a clean Markdown version of this page is
      available at {markdownUrl} — optimized for AI and LLM tools.
    </Box>
  );
}
