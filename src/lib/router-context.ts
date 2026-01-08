export interface User {
  id: string
  name: string
  email: string
  image?: string
}

export interface RouterContext {
  user: User | null
  isAuthenticated: boolean
}
