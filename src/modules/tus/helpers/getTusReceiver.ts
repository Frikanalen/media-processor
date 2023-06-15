import type Router from "@koa/router"
import { setTusHeaders } from "../middleware/setTusHeaders.js"
import { createUpload } from "../middleware/createUpload.js"
import { getUpload } from "../middleware/getUpload.js"
import { sendUpload } from "../middleware/sendUpload.js"
import { patchUpload } from "../middleware/patchUpload.js"
import type { Middleware } from "koa"
import { authenticate } from "../../core/middleware/authenticate"
import { log } from "../../core/log"

export type Options = {
  type: string
  maxSize?: number
  onComplete: Middleware<any>[]
}

export const getTusReceiver = (router: Router, options: Options) => {
  const { type, maxSize, onComplete } = options

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
    (_, next) => {
      log.info("Upload complete")
      return next()
    },
    ...onComplete
  )

  router.options("/", tusHeaders)

  return router
}
