import 'server-only';

import { NextResponse } from 'next/server';

export const jsonError = (message: string, status = 500) =>
  NextResponse.json({ error: message }, { status });
