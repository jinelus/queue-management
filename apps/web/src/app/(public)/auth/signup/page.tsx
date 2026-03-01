import { Route } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { SignUpForm } from '@/components/auth/sign-up-form'

export default function SignupPage() {
  return (
    <AuthShell
      title='Create your account'
      description='Start with QSpot and deliver a calmer, faster experience for guests and staff.'
      footer={
        <>
          Already have an account?{' '}
          <Link
            href={'/auth/signin' as Route}
            className='font-medium text-foreground hover:underline'
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  )
}
