import { env } from '@repo/env'
import { NextRequest, NextResponse } from 'next/server'
import { matchRouteRule } from '@/lib/route-access'

const isSecure = env.NEXT_PUBLIC_FRONT_END_URL.startsWith('https://')

const cookieName = isSecure ? '__Secure-qm_app.session_token' : 'qm_app.session_token'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = request.cookies.has(cookieName)
  const routeRule = matchRouteRule(pathname)

  if (routeRule.access === 'both') {
    return NextResponse.next()
  }

  const shouldRedirectToSignIn = routeRule.access === 'authenticated-only' && !isAuthenticated
  const shouldRedirectToDashboard = routeRule.access === 'unauthenticated-only' && isAuthenticated

  if (shouldRedirectToSignIn || shouldRedirectToDashboard) {
    const url = request.nextUrl.clone()
    url.pathname = routeRule.redirectTo
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|studio|.*\\.png$).*)'],
}
