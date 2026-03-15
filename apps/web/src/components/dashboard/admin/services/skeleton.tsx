import { Skeleton } from '@/components/ui/skeleton'

export function ManageServicesSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Skeleton className='size-9 rounded-md' />
          <div className='space-y-2'>
            <Skeleton className='h-7 w-40' />
            <Skeleton className='h-4 w-28' />
          </div>
        </div>
        <Skeleton className='h-9 w-36 rounded-md' />
      </div>

      <div className='hidden rounded-lg border md:block'>
        <div className='grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b px-4 py-3'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='ml-auto h-4 w-16' />
        </div>

        <div className='space-y-1 p-2'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className='grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-4 px-2 py-3'
            >
              <div className='space-y-2'>
                <Skeleton className='h-4 w-44' />
                <Skeleton className='h-3 w-60' />
              </div>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-6 w-11 rounded-full' />
                <Skeleton className='h-6 w-16 rounded-full' />
              </div>
              <Skeleton className='h-4 w-10' />
              <Skeleton className='h-4 w-16' />
              <div className='ml-auto flex items-center gap-1'>
                <Skeleton className='size-8 rounded-md' />
                <Skeleton className='size-8 rounded-md' />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='grid gap-3 md:hidden'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className='rounded-lg border p-4'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between gap-3'>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-36' />
                  <Skeleton className='h-3 w-48' />
                </div>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-6 w-11 rounded-full' />
                  <Skeleton className='h-6 w-16 rounded-full' />
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <Skeleton className='h-3 w-24' />
                <Skeleton className='h-3 w-20' />
              </div>

              <div className='flex items-center gap-2'>
                <Skeleton className='h-8 w-28 rounded-md' />
                <Skeleton className='h-8 w-8 rounded-md' />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='flex justify-end'>
        <Skeleton className='h-9 w-44 rounded-md' />
      </div>
    </div>
  )
}
