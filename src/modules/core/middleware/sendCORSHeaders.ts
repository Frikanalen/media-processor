import { Middleware } from "koa"
import { IS_PROD } from "../constants"

export const sendCORSHeaders = (): Middleware => (context, next) => {
  const { method } = context

  if (IS_PROD) return next()

  context.set("Access-Control-Allow-Origin", "http://localhost")
  context.set("Access-Control-Allow-Credentials", "true")
  context.set(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,PATCH,DELETE,OPTIONS"
  )

  context.set(
    "Access-Control-Allow-Headers",
    [
      "Content-Type",
      "Tus-Resumable",
      "Upload-Offset",
      "Upload-Length",
      "Upload-Metadata",
      "X-CSRF-Token",
      "Location",
    ].join(", ")
  )

  context.set(
    "Access-Control-Expose-Headers",
    ["Location", "Upload-Offset", "Upload-Length"].join(", ")
  )

  if (method === "OPTIONS") {
    context.status = 200
  }

  return next()
}
