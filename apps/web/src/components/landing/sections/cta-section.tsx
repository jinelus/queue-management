import { Route } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const CtaSection = () => {
  return (
    <section id='get-started' className='py-16 md:py-20' aria-labelledby='cta-heading'>
      <div className='rounded-2xl border bg-card p-8 text-center md:p-12'>
        <h2 id='cta-heading' className='font-semibold text-3xl tracking-tight md:text-4xl'>
          Build a calmer queue experience with QSpot.
        </h2>
        <p className='mx-auto mt-4 max-w-2xl text-muted-foreground'>
          Start with a clean virtual queue for guests, an efficient dashboard for staff, and
          real-time oversight for your operations team.
        </p>
        <div className='mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row'>
          <Button size='lg' asChild>
            <Link href={'/auth/signin' as Route}>Open QSpot</Link>
          </Button>
          <Button variant='outline' size='lg' asChild>
            <Link href='#experience'>Explore experience</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
