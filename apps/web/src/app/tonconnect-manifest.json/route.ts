import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Use header lookup to ensure we get the forwarded ngrok host, not localhost
  const hostHeader = request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  
  // Fallback to request.url origin if headers are missing (unlikely in ngrok)
  const fallbackOrigin = new URL(request.url).origin;
  const host = hostHeader ? `${proto}://${hostHeader}` : fallbackOrigin;

  const manifest = {
    url: host,
    name: 'TMA Boilerplate',
    iconUrl: `${host}/next.svg`,
    termsOfUseUrl: `${host}/terms.txt`,
    privacyPolicyUrl: `${host}/privacy.txt`,
  };

  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  });
}
