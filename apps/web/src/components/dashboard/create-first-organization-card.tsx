'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { OrganizationOutput } from '../../../utils/types'
import { Form, FormField, FormItem, FormLabel } from '../ui/form'

const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
})

type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>

type CreateFirstOrganizationCardProps = {
  organizations: Array<OrganizationOutput>
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

export function CreateFirstOrganizationCard({ organizations }: CreateFirstOrganizationCardProps) {
  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
    },
  })

  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleSubmit(data: CreateOrganizationInput) {
    const normalizedName = data.name.trim()
    const normalizedSlug = toSlug(normalizedName)

    if (!normalizedName || !normalizedSlug) {
      toast.error('Please provide a valid organization name.')
      return
    }

    await authClient.organization.create({
      name: normalizedName,
      slug: normalizedSlug,
      fetchOptions: {
        onSuccess: (response) => {
          toast.success('Organization created successfully.')
          setOpen(false)
          router.push(`/dashboard/${response.data.slug}` as Route)
          form.reset()
        },
        onError: (error) => {
          toast.error(
            `Failed to create organization. ${error.error.message || 'Please try again.'}`,
          )
        },
      },
    })
  }

  const hasOrganizations = organizations.length > 0

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle>Your organizations</CardTitle>
        <CardDescription>
          {hasOrganizations
            ? 'Select or create an organization to continue.'
            : 'You do not have an organization yet. Create your first one to continue.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasOrganizations ? (
          <ul className="space-y-2">
            {organizations.map((organization) => (
              <li key={organization.id} className="rounded-md border p-3">
                <p className="font-medium">{organization.name ?? 'Unnamed organization'}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No organization created yet.</p>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create organization</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create organization</DialogTitle>
              <DialogDescription>
                Enter a name and we will generate the slug automatically.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization name</FormLabel>
                      <Input {...field} placeholder="My organization" />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting || !form.formState.isValid}
                  >
                    {form.formState.isSubmitting ? 'Creating...' : 'Create organization'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
