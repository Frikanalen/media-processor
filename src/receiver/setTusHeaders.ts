import type { Middleware } from "koa"
export const TUS_RESUMABLE = "1.0.0"
export const TUS_EXTENSIONS = ["creation", "expiration"]
export const TUS_MAX_SIZE_DEFAULT = 500 * 1000 * 1000 // 500 mb

export const setTusHeaders =
  (maxSize = TUS_MAX_SIZE_DEFAULT): Middleware =>
  async (context, next) => {
    context.set("Tus-Extension", TUS_EXTENSIONS.join(","))
    context.set("Tus-Version", TUS_RESUMABLE)
    context.set("Tus-Resumable", TUS_RESUMABLE)
    context.set("Tus-Max-Size", String(maxSize))

    return next()
  }
