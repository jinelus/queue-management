'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { createGuestTicket } from '@/actions/tickets/mutations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SearchPublicOrganizationsResponseDtoOutput } from '@/gen'

type ServiceOption = {
  id: string
  name: string
  description?: string
  avgDurationInt?: number
}

type OrganizationTicketFormProps = {
  organization: SearchPublicOrganizationsResponseDtoOutput['organizations'][number]
  services: ServiceOption[]
}

const formSchema = z.object({
  guestName: z.string().min(1, 'Please enter your name.'),
  serviceId: z.string().min(1, 'Please choose a service.'),
})

type FormValues = z.infer<typeof formSchema>

export function OrganizationTicketForm({ organization, services }: OrganizationTicketFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestName: '',
      serviceId: services[0]?.id ?? '',
    },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const [error, response] = await createGuestTicket(organization.id, {
        guestName: values.guestName.trim(),
        serviceId: values.serviceId,
      })

      if (error || !response?.ticket) {
        toast.error('Could not create ticket right now. Please try again.')
        return
      }

      router.push(`/org/${organization.slug}/ticket/${response.ticket.id}` as Route)
    })
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{organization.name}</CardTitle>
        <CardDescription>Create your ticket by choosing one service.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Harry" maxLength={255} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose service</FormLabel>
                  <div className="grid gap-3">
                    {services.map((service) => (
                      <button
                        type="button"
                        key={service.id}
                        onClick={() => field.onChange(service.id)}
                        className={`rounded-lg border p-4 text-left transition-colors ${
                          field.value === service.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <p className="font-medium">{service.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {service.description ?? 'No service description.'}
                        </p>
                        <p className="mt-2 text-muted-foreground text-xs">
                          Average duration: {service.avgDurationInt ?? 0} min
                        </p>
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !form.formState.isValid}
            >
              {isPending ? 'Creating ticket...' : 'Create ticket'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
