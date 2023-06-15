import type Router from "@koa/router"
import { setTusHeaders } from "./setTusHeaders"
import { createUpload } from "./createUpload"
import { getUpload } from "./getUpload"
import { sendUpload } from "./sendUpload"
import { patchUpload } from "./patchUpload"
import type { Middleware } from "koa"
import { authenticate } from "../core/middleware/authenticate"
import { log } from "../core/log"

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
