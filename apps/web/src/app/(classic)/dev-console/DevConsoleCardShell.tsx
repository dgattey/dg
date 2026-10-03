import { Card, CardContent, Stack } from '@mui/material';
import type { ReactNode } from 'react';
import { DevConsoleCardBoundary } from './DevConsoleCardBoundary';

type DevConsoleCardShellProps = {
  children: ReactNode;
};

export function DevConsoleCardShell({ children }: DevConsoleCardShellProps) {
  return (
    <Card>
      <CardContent>
        <Stack
          sx={{
            gap: 2,
          }}
        >
          <DevConsoleCardBoundary>{children}</DevConsoleCardBoundary>
        </Stack>
      </CardContent>
    </Card>
  );
}
