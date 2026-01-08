import { auth } from "../../../src/server/auth"

export default defineEventHandler(async (event) => {
  return auth.handler(toWebRequest(event))
})
