import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const ProductPreviewSection = () => {
  return (
    <section id='experience' className='py-16 md:py-20' aria-labelledby='experience-heading'>
      <div className='mb-8 max-w-3xl'>
        <h2 id='experience-heading' className='font-semibold text-3xl tracking-tight md:text-4xl'>
          Designed to feel trustworthy in every moment.
        </h2>
        <p className='mt-3 text-muted-foreground'>
          The interface follows a calm guest journey and a high-focus staff workflow inspired by
          modern SaaS clarity.
        </p>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Guest waiting room preview</CardTitle>
            <CardDescription>Image placeholder for mobile waiting room design.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className='rounded-lg border bg-muted/50 p-4'
              role='img'
              aria-label='Placeholder for guest waiting room screenshot'
            >
              <Skeleton className='h-48 w-full rounded-md' />
              <div className='mt-4 space-y-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-10 w-28' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff dashboard walkthrough</CardTitle>
            <CardDescription>Video placeholder for queue handling workflow.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className='rounded-lg border bg-muted/50 p-4'
              role='img'
              aria-label='Placeholder for staff dashboard demo video'
            >
              <div className='relative'>
                <Skeleton className='h-48 w-full rounded-md' />
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='rounded-full border bg-background px-4 py-2 text-sm'>Video</div>
                </div>
              </div>
              <div className='mt-4 space-y-2'>
                <Skeleton className='h-4 w-28' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-4/5' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
