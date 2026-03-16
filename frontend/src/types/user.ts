export type User = {
  id: string
  name: string
  email: string
}

export type ApiResponse<T> = {
  error: string | null
  data: T | null
}
