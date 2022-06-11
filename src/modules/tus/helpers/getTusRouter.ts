import Router from "@koa/router"
import { setTusHeaders } from "../middleware/setTusHeaders"
import { createUpload } from "../middleware/createUpload"
import { getUpload } from "../middleware/getUpload"
import { sendUpload } from "../middleware/sendUpload"
import { patchUpload } from "../middleware/patchUpload"
import { Middleware } from "koa"
import { authenticate } from "../../auth/middleware/authenticate"

export type Options = {
  type: string
  maxSize?: number
  afterUploadMiddleware: Middleware<any>[]
}

export const getTusRouter = (options: Options) => {
  const { type, maxSize, afterUploadMiddleware } = options

  const router = new Router({ prefix: `/upload/${type}` })
  const tusHeaders = setTusHeaders(maxSize)

  router.post(
    "/",
    authenticate({ required: true }),
    tusHeaders,
    createUpload({ type, maxSize })
  )

  router.head(
    "/:key",
    authenticate({ required: true }),
    tusHeaders,
    getUpload(type),
    sendUpload()
  )

  router.patch(
    "/:key",
    authenticate({ required: true }),
    getUpload(type),
    patchUpload(),
    ...afterUploadMiddleware
  )

  router.options("/", tusHeaders)

  return router
}
