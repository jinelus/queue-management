import { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import logoImg from '../../../../public/logo.svg'

export const LandingHeader = () => {
  return (
    <header className='sticky top-0 z-90 border-b bg-background/90 backdrop-blur'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4'>
        <Link href='/' className='relative flex items-end font-semibold' aria-label='QSpot home'>
          <Image src={logoImg} alt='QSpot logo' className='mr-2 inline-block size-14' />
          <span className='absolute -right-5 bottom-1'>Spot</span>
        </Link>

        <nav aria-label='Main navigation' className='hidden items-center gap-6 text-sm md:flex'>
          <Link href='#features' className='text-muted-foreground transition hover:text-foreground'>
            Features
          </Link>
          <Link
            href='#experience'
            className='text-muted-foreground transition hover:text-foreground'
          >
            Experience
          </Link>
          <Link
            href='#how-it-works'
            className='text-muted-foreground transition hover:text-foreground'
          >
            How it works
          </Link>
        </nav>

        <div className='flex items-center gap-2'>
          <Button variant='ghost' asChild>
            <Link href={'/auth/signin' as Route}>Sign in</Link>
          </Button>
          <Button asChild>
            <Link href='#get-started'>Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
