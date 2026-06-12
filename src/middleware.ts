import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUBDOMAIN_MAP: Record<string, string> = {
  kitchen: '/kitchen',
  social:  '/hub',
  rewards: '/rewards',
};

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const pathname = request.nextUrl.pathname;

  // Extract subdomain — works for kitchen.halalme.co.uk and localhost preview
  const subdomain = host.split('.')[0];

  // Subdomain routing
  if (subdomain in SUBDOMAIN_MAP) {
    const targetPath = SUBDOMAIN_MAP[subdomain];

    // Already on the right path — don't loop
    if (pathname.startsWith(targetPath)) {
      return NextResponse.next();
    }

    // Rewrite / to /kitchen, /hub, /rewards
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? targetPath : `${targetPath}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Block Phase 2 routes on main domain
  const blockedPaths = ['/fresh', '/travel', '/marketplace'];
  if (blockedPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Exclude /api so request bodies (e.g. document uploads) aren't buffered and
  // truncated by the middleware — the route handlers do their own size checks.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo|images|fonts).*)'],
};
