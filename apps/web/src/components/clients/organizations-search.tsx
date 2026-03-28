import { Route } from 'next'
import Link from 'next/link'
import { searchPublicOrganizations } from '@/actions/organizations/get'
import { loadClientsSearchParams } from '@/app/(public)/org/search-params'
import { QueryPagination } from '@/components/custom/pagination'
import { SearchInput } from '@/components/custom/search'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export async function OrganizationsSearch(props: PageProps<'/org'>) {
  const { page, perPage, q } = await loadClientsSearchParams(props.searchParams)
  const [error, response] = await searchPublicOrganizations({
    q,
    page,
    perPage,
    order: 'asc',
    orderBy: 'name',
  })

  const organizations = !error && response?.organizations ? response.organizations : []
  const totalPages = !error && response?.meta?.totalPages ? response.meta.totalPages : 1

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Choose an organization</CardTitle>
          <CardDescription>
            Search by name or slug and open the queue page to create your ticket.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchInput placeholder="Search organization..." />
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {organizations.map((organization) => (
          <Link key={organization.id} href={`/org/${organization.slug}` as Route}>
            <Card className="transition-colors hover:bg-accent">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{organization.name}</CardTitle>
                  <Badge variant="secondary">{organization.slug}</Badge>
                </div>
                <CardDescription>
                  {organization.description ?? 'No description provided.'}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}

        {organizations.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No organizations found for this search.
            </CardContent>
          </Card>
        )}
      </div>

      <QueryPagination totalPages={totalPages} />
    </div>
  )
}
