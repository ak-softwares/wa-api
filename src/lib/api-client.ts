type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  headers?: Record<string, string>
  body?: any
}

class ApiClient {
    async myFetch<T>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { method = "GET", headers = {}, body } = options
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    }
    const res = await fetch(url, {
      method,
      headers: defaultHeaders,
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error("Failed to fetch")
    return res.json()
  }
}

export const apiClient = new ApiClient()