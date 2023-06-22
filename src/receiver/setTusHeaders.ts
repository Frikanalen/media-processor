import type { Middleware } from "koa"
export const TUS_RESUMABLE = "1.0.0"
export const TUS_EXTENSIONS = ["creation", "expiration"]
export const TUS_MAX_SIZE = 500 * 1000 * 1000 // 500 mb

export const setTusHeaders: Middleware = async (ctx, next) => {
  ctx.set("Tus-Extension", TUS_EXTENSIONS.join(","))
  ctx.set("Tus-Version", TUS_RESUMABLE)
  ctx.set("Tus-Resumable", TUS_RESUMABLE)
  ctx.set("Tus-Max-Size", String(TUS_MAX_SIZE))

  return next()
}
