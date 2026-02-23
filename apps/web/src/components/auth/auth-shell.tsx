import Link from 'next/link'
import type { ReactNode } from 'react'

type AuthShellProps = {
  title: string
  description: string
  footer: ReactNode
  children: ReactNode
}

export const AuthShell = ({ title, description, footer, children }: AuthShellProps) => {
  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.96_0.02_240)_0%,transparent_48%)]' />

      <section className='relative z-10 w-full max-w-md'>
        <div className='mb-8 text-center'>
          <p className='text-muted-foreground text-sm'>
            <Link href='/' className='font-semibold hover:underline'>
              ← Back to QSpot
            </Link>
          </p>
          <h1 className='mt-4 text-balance font-semibold text-3xl tracking-tight'>{title}</h1>
          <p className='mt-2 text-muted-foreground'>{description}</p>
        </div>

        {children}

        <div className='mt-6 text-center text-muted-foreground text-sm'>{footer}</div>
      </section>
    </main>
  )
}
