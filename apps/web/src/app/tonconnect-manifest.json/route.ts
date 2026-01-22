import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Use header lookup to ensure we get the forwarded host
  const forwardedHost = request.headers.get('x-forwarded-host');
  const hostHeader = request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  
  // Prefer forwarded host (common in tunnels/proxies), then host header, then fallback
  const effectiveHost = forwardedHost || hostHeader || new URL(request.url).host;
  
  // Force HTTPS unless strictly localhost
  const protocol = effectiveHost.includes('localhost') ? 'http' : 'https';
  const host = `${protocol}://${effectiveHost}`;

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
