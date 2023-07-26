import type { Middleware } from "koa"

export const sendCORSDev = (): Middleware => (context, next) => {
  context.set("Access-Control-Allow-Origin", "http://localhost:3000")
  context.set("Access-Control-Allow-Credentials", "true")
  context.set(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,PATCH,DELETE,OPTIONS,HEAD",
  )

  context.set("Access-Control-Allow-Headers", "X-CSRF-Token")

  if (context.method === "OPTIONS") context.status = 200

  return next()
}
