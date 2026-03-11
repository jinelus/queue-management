import { Route } from 'next'
import { Suspense } from 'react'
import { Allowed } from '@/components/auth/allowed'

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense>
        <Allowed allow='authenticated' redirectTo={'/auth/signin' as Route} />
      </Suspense>
      {children}
    </>
  )
}
