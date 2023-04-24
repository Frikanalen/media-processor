import { register } from "prom-client"
import type { Middleware } from "koa"

export const showMetrics: Middleware = async (ctx, next) => {
  if (ctx.path !== "/metrics") await next()
  ctx.set("Content-Type", register.contentType)
  ctx.body = register.metrics()
}
