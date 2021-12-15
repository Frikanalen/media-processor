import { Middleware } from "koa"
import { TUS_EXTENSIONS, TUS_RESUMABLE, TUS_MAX_SIZE_DEFAULT } from "../constants"

export const setTusHeaders = (maxSize = TUS_MAX_SIZE_DEFAULT): Middleware => async (
  context,
  next,
) => {
  context.set("Tus-Extension", TUS_EXTENSIONS.join(","))
  context.set("Tus-Version", TUS_RESUMABLE)
  context.set("Tus-Resumable", TUS_RESUMABLE)
  context.set("Tus-Max-Size", String(maxSize))

  return next()
}
