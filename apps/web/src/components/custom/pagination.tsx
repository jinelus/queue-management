'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { FC } from 'react'
import { Button } from '../ui/button'

interface QueryPaginationProps {
  totalPages: number
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
    <div className="flex items-center justify-between gap-3">
      <p className="text-muted-foreground text-sm">
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setParams({ page: page - 1 })}
          disabled={page <= 1}
        >
          <ChevronLeftIcon className="size-4" />
          Previous
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
          <Button
            key={pageNumber}
            type="button"
            size="icon"
            variant={pageNumber === page ? 'default' : 'outline'}
            onClick={() => setParams({ page: pageNumber })}
            aria-label={`Go to page ${pageNumber}`}
            aria-current={pageNumber === page ? 'page' : undefined}
          >
            {pageNumber}
          </Button>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setParams({ page: page + 1 })}
          disabled={page >= totalPages}
        >
          Next
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  ) : null
}
