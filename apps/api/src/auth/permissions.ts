import { createAccessControl } from 'better-auth/plugins/access'
import {
  adminAc,
  defaultStatements as defaultAdminStatements,
  userAc,
} from 'better-auth/plugins/admin/access'

export const statements = {
  ...defaultAdminStatements,
  organization: ['create', 'update', 'delete', 'get', 'list'],
  service: ['create', 'update', 'delete', 'get', 'list'],
  ticket: ['create', 'update', 'delete', 'get', 'list', 'assign', 'close'],
  serviceStaff: ['create', 'update', 'delete', 'get', 'list'],
} as const

export const ac = createAccessControl(statements)

export const developer = ac.newRole({
  ...adminAc.statements,
  organization: [...statements.organization],
  service: [...statements.service],
  serviceStaff: [...statements.serviceStaff],
  ticket: [...statements.ticket],
})

export const admin = ac.newRole({
  ...adminAc.statements,
  user: ['ban', 'create', 'delete', 'list', 'set-password', 'set-role', 'update', 'get'],
  organization: [...statements.organization],
  service: [...statements.service],
  serviceStaff: [...statements.serviceStaff],
  ticket: [...statements.ticket],
})

export const employee = ac.newRole({
  ...userAc.statements,
  organization: ['get', 'list'],
  service: ['get', 'list', 'update'],
  serviceStaff: ['get', 'list'],
  ticket: ['assign', 'close', 'create', 'get', 'list', 'update'],
  user: ['get', 'list'],
})

export const user = ac.newRole({
  ...userAc.statements,
  organization: ['get'],
  service: ['get', 'list'],
  ticket: ['create', 'get', 'list'],
})
