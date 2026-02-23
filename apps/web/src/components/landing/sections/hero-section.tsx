import { Route } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const highlights = [
  'Calm, transparent guest experience',
  'Fast call-next workflow for staff',
  'Live visibility for operations',
]

export const HeroSection = () => {
  return (
    <section className='relative w-full overflow-hidden bg-linear-to-b from-background to-amber-50/70 px-6 py-20 md:py-32'>
      <div
        className='absolute inset-0'
        style={{
          backgroundImage: `
        linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
      `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 0',
          maskImage: `
        repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)
      `,
          WebkitMaskImage: `
  repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)
      `,
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
      />

      <div className='mx-auto flex w-full max-w-7xl flex-wrap items-center gap-16'>
        <div className='z-50 flex-[1.5]'>
          <Badge
            variant='secondary'
            className='mb-6 rounded-full border-border bg-muted px-4 py-1 text-primary text-sm'
          >
            <div className='size-2 animate-pulse rounded-full bg-blue-600' />
            Virtual Queue Management Platform
          </Badge>

          <h1 className='text-balance font-semibold text-4xl tracking-tight md:text-6xl'>
            QSpot turns waiting into a calm, modern experience.
          </h1>

          <p className='mt-6 max-w-2xl text-pretty text-muted-foreground text-xl'>
            We help organizations reduce lobby chaos with a virtual queue that keeps guests
            informed, empowers staff to move faster, and gives managers real-time control.
          </p>

          <div className='mt-8 flex flex-row flex-wrap items-center gap-3'>
            <Button asChild size='lg'>
              <Link href='#get-started'>Start with QSpot</Link>
            </Button>
            <Button variant='outline' size='lg' asChild>
              <Link href={'/auth/signin' as Route}>See product flow</Link>
            </Button>
          </div>

          <ul className='mt-10 grid gap-3 text-left sm:grid-cols-3' aria-label='Core highlights'>
            {highlights.map((item) => (
              <li key={item} className='rounded-lg border bg-card p-4 text-center text-sm'>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className='flex-1'>
          <div className='relative h-[65vh] w-full'>
            <div className='absolute top-4 left-0 w-full border border-dashed' />
            <div className='absolute bottom-4 left-0 w-full border border-dashed' />
            <div className='absolute top-0 left-4 h-full border' />
            <div className='absolute top-0 right-4 h-full border' />
            <div className='h-full w-full min-w-sm p-8'>
              <Skeleton className='h-full w-full rounded-md' />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
