import { getCurrentUser, listUserOrganizations } from '@/lib/current-user'

export type UserOutput = Awaited<ReturnType<typeof getCurrentUser>> & {
  role?: string
}

export type OrganizationOutput = Awaited<ReturnType<typeof listUserOrganizations>>[number]
