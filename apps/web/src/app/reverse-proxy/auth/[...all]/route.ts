import { env } from '@repo/env'

const BACKEND_URL = env.BACKEND_URL

async function proxyRequest(request: Request) {
  const url = new URL(request.url)
  const targetUrl = `${BACKEND_URL}api/auth${url.pathname.replace('/reverse-proxy/auth', '')}${url.search}`

  const headers = new Headers(request.headers)
  headers.delete('host')

  const body =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer()

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
  })

  const newHeaders = new Headers(response.headers)
  newHeaders.delete('content-encoding')
  newHeaders.delete('transfer-encoding')

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  })
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
