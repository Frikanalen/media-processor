import type { Middleware } from "koa"
import { HttpError } from "../classes/HttpError.js"
import * as Yup from "yup"

export const handleError = (): Middleware => async (context, next) => {
  try {
    return await next()
  } catch (error: any) {
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

    console.error(error)

    return
  }
}

export default handleError
