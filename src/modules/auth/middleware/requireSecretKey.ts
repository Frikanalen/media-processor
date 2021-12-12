import { Middleware } from "koa"
import { HttpError } from "../../core/classes/HttpError"
import { SECRET_KEY, SECRET_KEY_HEADER } from "../../core/constants"

export const requireSecretKey = (): Middleware => (context, next) => {
  const key = context.get(SECRET_KEY_HEADER)

  if (key !== SECRET_KEY) {
    throw new HttpError(400)
  }

  return next()
}
