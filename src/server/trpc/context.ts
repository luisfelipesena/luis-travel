import { auth } from "../auth"

export interface Context {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  } | null
}

export async function createContext(req: Request): Promise<Context> {
  const session = await auth.api.getSession({
    headers: req.headers,
  })

  return {
    user: session?.user
      ? {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }
      : null,
  }
}
