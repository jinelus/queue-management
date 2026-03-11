'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { addService } from '@/actions/services'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(255),
  description: z.string().optional(),
  maxCapacity: z.string().optional(),
  avgDurationInt: z.string().optional(),
})

type CreateServiceInput = z.infer<typeof createServiceSchema>

type CreateServiceDialogProps = {
  organizationId: string
}

export function CreateServiceDialog({ organizationId }: CreateServiceDialogProps) {
  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: '',
      description: '',
      maxCapacity: '',
      avgDurationInt: '',
    },
  })

  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleSubmit(data: CreateServiceInput) {
    const [error] = await addService(organizationId, {
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      maxCapacity: data.maxCapacity ? Number(data.maxCapacity) : undefined,
      avgDurationInt: data.avgDurationInt ? Number(data.avgDurationInt) : undefined,
    })

    if (error) {
      toast.error('Failed to create service. Please try again.')
      return
    }

    toast.success('Service created successfully.')
    setOpen(false)
    form.reset()
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <PlusIcon />
          Add service
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create service</DialogTitle>
          <DialogDescription>Add a new service to your organization.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <Input {...field} placeholder='e.g. General Consultation' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <Textarea {...field} placeholder='Optional description' />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='maxCapacity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max capacity</FormLabel>
                    <Input
                      {...field}
                      type='number'
                      onChange={field.onChange}
                      placeholder='e.g. 50'
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='avgDurationInt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avg duration (min)</FormLabel>
                    <Input
                      {...field}
                      type='number'
                      onChange={field.onChange}
                      placeholder='e.g. 15'
                    />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type='submit'
                disabled={form.formState.isSubmitting || !form.formState.isValid}
              >
                {form.formState.isSubmitting ? 'Creating...' : 'Create service'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
