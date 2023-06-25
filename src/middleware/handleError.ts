import type { Middleware } from "koa"
import * as Yup from "yup"
import { log } from "../log.js"

export const handleError: Middleware = async (context, next) => {
  try {
    return await next()
  } catch (error: any) {
    log.error(error)
    if (error instanceof Yup.ValidationError)
      context.throw(400, "validation_error", { details: error.errors })
  }
}

export default handleError
