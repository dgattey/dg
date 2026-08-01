import 'server-only';

export function GET() {
  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
    },
  });
}
