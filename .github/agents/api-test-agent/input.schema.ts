export type ApiTestAgentInput = {
  endpoint: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

  description?: string

  request: {
    body?: any
    query?: Record<string, string>
    params?: Record<string, string>
  }

  response: {
    status: number
    bodyExample: any
  }

  useHelper?: boolean
  entityName?: string
}