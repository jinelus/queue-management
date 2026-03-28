'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { FC } from 'react'
import { Button } from '../ui/button'

interface QueryPaginationProps {
  totalPages: number
}

type PaginationItem = number | 'ellipsis-left' | 'ellipsis-right'

function getVisibleItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pageNumbers = new Set<number>([1, totalPages])

  if (currentPage <= 3) {
    pageNumbers.add(2)
    pageNumbers.add(3)
  } else if (currentPage >= totalPages - 2) {
    pageNumbers.add(totalPages - 2)
    pageNumbers.add(totalPages - 1)
  } else {
    pageNumbers.add(currentPage - 1)
    pageNumbers.add(currentPage)
  }

  const sortedPages = [...pageNumbers].sort((a, b) => a - b)
  const items: PaginationItem[] = []

  for (let index = 0; index < sortedPages.length; index++) {
    const current = sortedPages[index]
    const previous = sortedPages[index - 1]

    if (current === undefined) {
      continue
    }

    if (previous !== undefined && current - previous > 1) {
      items.push(previous === 1 ? 'ellipsis-left' : 'ellipsis-right')
    }

    items.push(current)
  }

  return items
}

export const QueryPagination: FC<QueryPaginationProps> = ({ totalPages }) => {
  const [{ page }, setParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
    },
    {
      shallow: false,
      clearOnDefault: true,
    },
  )

  return totalPages > 1 ? (
    <div className='flex items-center justify-between gap-3'>
      <p className='text-muted-foreground text-sm'>
        Page {page} of {totalPages}
      </p>

      <div className='flex items-center gap-1'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => setParams({ page: page - 1 })}
          disabled={page <= 1}
        >
          <ChevronLeftIcon className='size-4' />
          Previous
        </Button>

        {getVisibleItems(page, totalPages).map((item, index) => {
          if (typeof item !== 'number') {
            return (
              <span
                key={`${item}-${index}`}
                aria-hidden='true'
                className='px-1 text-muted-foreground text-sm'
              >
                ...
              </span>
            )
          }

          return (
            <Button
              key={item}
              type='button'
              size='icon'
              variant={item === page ? 'default' : 'outline'}
              onClick={() => setParams({ page: item })}
              aria-label={`Go to page ${item}`}
              aria-current={item === page ? 'page' : undefined}
            >
              {item}
            </Button>
          )
        })}

        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => setParams({ page: page + 1 })}
          disabled={page >= totalPages}
        >
          Next
          <ChevronRightIcon className='size-4' />
        </Button>
      </div>
    </div>
  ) : null
}
