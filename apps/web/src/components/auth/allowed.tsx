import { Route } from 'next'
import { redirect } from 'next/navigation'
import { getToken } from '@/lib/token'

export async function Allowed<T extends Parameters<typeof redirect>[0] | string>({
  children,
  allow,
  redirectTo,
}: {
  children?: React.ReactNode | React.ReactNode[]
  redirectTo: Route<T>
  allow: 'authenticated' | 'unauthenticated'
}) {
  const authenticated = await getToken()

  if (allow === 'authenticated') {
    if (!authenticated) {
      redirect(redirectTo)
    }
  }

  if (allow === 'unauthenticated') {
    if (authenticated) {
      redirect(redirectTo)
    }
  }

  return <>{children}</>
}
