import type { Middleware } from "koa"
import { HttpError } from "../HttpError.js"
import * as Yup from "yup"
import { log } from "../log.js"

export const handleError = (): Middleware => async (context, next) => {
  try {
    return await next()
  } catch (error: any) {
    log.error(`in handleError: ${error}`)

    if (error instanceof HttpError) {
      const { code, reason, details } = error

      context.status = code
      context.body = {
        message: reason,
        details,
      }

      return
    }

    if (error instanceof Yup.ValidationError) {
      context.status = 400
      context.body = {
        message: "Validation Error",
        details: error.errors,
      }

      return
    }

    context.status = 500
    context.body = {
      message: "Internal Server Error",
    }

    return
  }
}

export default handleError
