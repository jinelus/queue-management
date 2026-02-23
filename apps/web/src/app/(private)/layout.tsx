import { Allowed } from '@/components/auth/allowed'
import { Route } from 'next'
import { Suspense } from 'react'

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Suspense>
        <Allowed allow="authenticated" redirectTo={'/auth/signin' as Route} />
      </Suspense>
      {children}
    </main>
  )
}
