import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasRefreshCookie = request.cookies.has('refreshToken');

  // Redirect authenticated users away from auth pages
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (hasRefreshCookie) {
      return NextResponse.redirect(new URL('/boards', request.url));
    }
    return NextResponse.next();
  }

  // Protect all app routes — redirect to login if not authenticated
  if (!hasRefreshCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
