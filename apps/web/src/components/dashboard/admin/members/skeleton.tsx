import { Skeleton } from '@/components/ui/skeleton'

export function ManageMembersSkeleton() {
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
        <Skeleton className='h-9 w-32 rounded-md' />
      </div>

      <div className='hidden rounded-lg border md:block'>
        <div className='grid grid-cols-[2fr_1fr_1fr] gap-4 border-b px-4 py-3'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-12' />
          <Skeleton className='h-4 w-14' />
        </div>

        <div className='space-y-1 p-2'>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className='grid grid-cols-[2fr_1fr_1fr] items-center gap-4 px-2 py-3'>
              <div className='flex items-center gap-3'>
                <Skeleton className='size-8 rounded-full' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-36' />
                  <Skeleton className='h-3 w-52' />
                </div>
              </div>
              <Skeleton className='h-6 w-16 rounded-full' />
              <Skeleton className='h-4 w-24' />
            </div>
          ))}
        </div>
      </div>

      <div className='grid gap-3 md:hidden'>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className='rounded-lg border p-4'>
            <div className='flex items-center gap-3'>
              <Skeleton className='size-10 rounded-full' />
              <div className='flex min-w-0 flex-1 flex-col gap-2'>
                <div className='flex items-center justify-between gap-2'>
                  <Skeleton className='h-4 w-28' />
                  <Skeleton className='h-6 w-16 rounded-full' />
                </div>
                <Skeleton className='h-3 w-44' />
                <Skeleton className='h-3 w-24' />
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
