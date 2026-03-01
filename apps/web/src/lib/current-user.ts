import { Route } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { tryCatch } from '../../utils/trycatch'
import { authClient } from './auth-client'

export async function getCurrentUser() {
  const [error, session] = await tryCatch(async () => {
    return authClient.getSession({
      fetchOptions: {
        headers: await headers(),
      },
    })
  })

  if (error) {
    console.error('Error fetching session:', error)
    redirect(`/auth/signin` as Route)
  }

  const { data } = session

  if (!data) {
    console.error('No session data found')
    redirect(`/auth/signin` as Route)
  }

  return data.user
}

export async function listUserOrganizations() {
  const result = await authClient.organization.list({
    fetchOptions: {
      headers: await headers(),
    },
  })

  if (!result.data) {
    return []
  }

  return result.data
}
