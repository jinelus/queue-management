import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const steps = [
  {
    title: '1. Join',
    body: 'Guests choose a service, enter their name, and get instant queue position with estimated wait.',
  },
  {
    title: '2. Wait Anywhere',
    body: 'Live updates, status visibility, and turn notifications reduce uncertainty and lobby crowding.',
  },
  {
    title: '3. Serve Faster',
    body: 'Staff call next, resolve outcomes, and keep flow moving with minimal clicks on one dashboard.',
  },
]

export const WorkflowSection = () => {
  return (
    <section id='how-it-works' className='py-16 md:py-20' aria-labelledby='workflow-heading'>
      <div className='mb-8 max-w-2xl'>
        <h2 id='workflow-heading' className='font-semibold text-3xl tracking-tight md:text-4xl'>
          One simple flow, better outcomes.
        </h2>
      </div>

      <ol className='grid gap-4 md:grid-cols-3'>
        {steps.map((step) => (
          <li key={step.title}>
            <Card className='h-full'>
              <CardHeader>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent className='text-muted-foreground text-sm'>{step.body}</CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  )
}
