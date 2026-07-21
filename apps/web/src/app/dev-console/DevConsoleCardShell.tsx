import { Card, CardContent, Stack } from '@mui/material';
import type { ReactNode } from 'react';

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
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}
