'use server'

import { env } from '@repo/env'
import { cookies } from 'next/headers'

const isSecure = env.NEXT_PUBLIC_FRONT_END_URL.startsWith('https://')

const cookieName = isSecure ? '__Secure-qm_app.session_token' : 'qm_app.session_token'

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies()

  const cookiesToken = cookieStore.get(cookieName)?.value

  const token = cookiesToken ? cookiesToken.split('.')[0] : undefined

  return token
}

export async function isUserAuthenticated(): Promise<boolean> {
  const token = await getToken()

  return !!token
}
