export type Access = 'authenticated-only' | 'unauthenticated-only' | 'both'
export type Match = 'exact' | 'prefix'

export type RouteRule = {
  path: string
  access: Access
  redirectTo: string
  match?: Match
}

export const routeRules: RouteRule[] = [
  {
    path: '/reverse-proxy',
    access: 'both',
    redirectTo: '/reverse-proxy',
    match: 'prefix',
  },
  {
    path: '/auth/signin',
    access: 'unauthenticated-only',
    redirectTo: '/dashboard',
    match: 'exact',
  },
  {
    path: '/auth/signup',
    access: 'unauthenticated-only',
    redirectTo: '/dashboard',
    match: 'exact',
  },
  {
    path: '/dashboard',
    access: 'authenticated-only',
    redirectTo: '/auth/signin',
    match: 'prefix',
  },
  {
    path: '/',
    access: 'both',
    redirectTo: '/',
    match: 'exact',
  },
]

export const defaultRule: RouteRule = {
  path: '/',
  access: 'both',
  redirectTo: '/',
  match: 'exact',
}

export function matchRouteRule(pathname: string): RouteRule {
  const exactMatch = routeRules.find((rule) => (rule.match ?? 'exact') === 'exact' && rule.path === pathname)

  if (exactMatch) {
    return exactMatch
  }

  const prefixMatches = routeRules
    .filter((rule) => (rule.match ?? 'exact') === 'prefix' && pathname.startsWith(rule.path))
    .sort((first, second) => second.path.length - first.path.length)

  return prefixMatches[0] ?? defaultRule
}