import { env } from '@repo/env'
import ky, { HTTPError, type Options as KyOptions } from 'ky'
import { getToken } from './token'

export type RequestConfig<TData = unknown> = {
  url?: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  params?: object
  data?: TData | FormData
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer' | 'document' | 'stream'
  signal?: AbortSignal
  headers?: HeadersInit
} & RequestInit

export type ResponseErrorConfig<TError = unknown> = TError

export type ResponseConfig<TData = unknown, TError = unknown> =
  | [ResponseErrorConfig<TError>, null]
  | [null, TData]

const KY_INSTANCE = ky.create({
  prefixUrl: env.BACKEND_URL,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await getToken()

        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
  },
})

async function parseResponse(response: Response, responseType?: string): Promise<unknown> {
  if (response.status === 204) {
    return null
  }

  switch (responseType) {
    case 'text':
      return await response.text()
    case 'blob':
      return await response.blob()
    case 'arraybuffer':
      return await response.arrayBuffer()
    default: {
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        return await response.json()
      } else if (contentType.includes('text/')) {
        return await response.text()
      } else {
        return await response.blob()
      }
    }
  }
}

export const httpClient = async <TData = unknown, TError = unknown, TVariables = unknown>(
  config: RequestConfig<TVariables>,
): Promise<ResponseConfig<TData, TError>> => {
  try {
    const { url = '', method, params, data, responseType, signal, headers } = config

    const kyOptions: KyOptions = {
      method: method.toLowerCase() as Lowercase<typeof method>,
      signal,
      headers,
    }

    if (params) {
      kyOptions.searchParams = params as Record<string, string | number | boolean>
    }

    if (data) {
      if (data instanceof FormData) {
        kyOptions.body = data
      } else {
        kyOptions.json = data
      }
    }

    const response = await KY_INSTANCE(url.startsWith('/') ? url.slice(1) : url, kyOptions)

    const responseData = await parseResponse(response, responseType)
    return [null, responseData as TData]
  } catch (error) {
    if (error instanceof HTTPError) {
      const { response } = error
      let errorData: unknown

      try {
        errorData = await parseResponse(response)
      } catch {
        errorData = {
          status: response.status,
          message: response.statusText,
        }
      }
      return [errorData as ResponseErrorConfig<TError>, null]
    }

    const networkError = {
      message: error instanceof Error ? error.message : 'Unknown error',
      type: 'network_error',
      status: 0,
      statusText: 'Network Error',
    }
    return [networkError as ResponseErrorConfig<TError>, null]
  }
}

export default httpClient
