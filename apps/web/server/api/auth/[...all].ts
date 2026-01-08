import { fromWebHandler } from "h3"
import { auth } from "../../auth"

export default fromWebHandler(auth.handler)
