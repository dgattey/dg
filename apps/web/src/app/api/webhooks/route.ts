import type { NextRequest, NextResponse } from 'next/server';
import { handleWebhookGet } from './handleWebhookGet';
import { handleWebhookPost } from './handleWebhookPost';

export function GET(request: NextRequest): NextResponse {
  return handleWebhookGet(request);
}

export function POST(request: NextRequest): Promise<NextResponse> {
  return handleWebhookPost(request);
}
