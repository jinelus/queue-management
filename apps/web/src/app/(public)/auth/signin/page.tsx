import { Route } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { SignInForm } from '@/components/auth/sign-in-form'

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to manage live queues, serve clients faster, and keep operations clear."
      footer={
        <>
          No account yet?{' '}
          <Link
            href={'/auth/signup' as Route}
            className="font-medium text-foreground hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthShell>
  )
}
