import type { Middleware } from "koa"
import { HttpError } from "../../core/classes/HttpError.js"
import { FK_API_KEY, SECRET_KEY_HEADER } from "../../core/constants.js"

export const requireSecretKey = (): Middleware => (context, next) => {
  const key = context.get(SECRET_KEY_HEADER)

  if (key !== FK_API_KEY) {
    throw new HttpError(400)
  }

  return next()
}
