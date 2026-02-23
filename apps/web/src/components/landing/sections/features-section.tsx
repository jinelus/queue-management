import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    title: 'For guests: calm and clear',
    description:
      'Guests join in seconds, see live position and ETA, and wait from anywhere without uncertainty.',
  },
  {
    title: 'For staff: efficient and focused',
    description:
      'A dark-mode dashboard keeps call-next, served, absent, and transfer actions visible and fast.',
  },
  {
    title: 'For managers: real-time control',
    description:
      'Live metrics and service-level visibility reveal bottlenecks quickly and support better staffing decisions.',
  },
]

export const FeaturesSection = () => {
  return (
    <section id='features' className='py-16 md:py-20' aria-labelledby='features-heading'>
      <div className='mb-8 max-w-2xl'>
        <h2 id='features-heading' className='font-semibold text-3xl tracking-tight md:text-4xl'>
          Built for every side of the queue.
        </h2>
        <p className='mt-3 text-muted-foreground'>
          QSpot aligns with your operating reality: simple for guests, fast for staff, and
          transparent for leadership.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className='text-muted-foreground text-sm'>
              Accessibility-first interactions with readable contrast, keyboard support, and
              assistive announcement patterns.
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
