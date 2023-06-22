import type Router from "@koa/router"
import { setTusHeaders } from "./setTusHeaders.js"
import { createUpload } from "./createUpload.js"
import { uploadGet } from "./uploadGet.js"
import { sendUpload } from "./sendUpload.js"
import type { Middleware } from "koa"
import { authenticate } from "../middleware/authenticate.js"
import { log } from "../log.js"
import { uploadPatch } from "./uploadPatch.js"

export type Options = {
  maxSize?: number
  onComplete: Middleware<any>
}

export const getTusReceiver = (router: Router, options: Options) => {
  const { maxSize, onComplete } = options

  const tusHeaders = setTusHeaders(maxSize)

  router.post(
    "/",
    authenticate({ required: true }),
    tusHeaders,
    createUpload({ maxSize })
  )

  router.head(
    "/:key",
    authenticate({ required: true }),
    tusHeaders,
    uploadGet,
    sendUpload
  )

  router.patch(
    "/:key",
    authenticate({ required: true }),
    uploadGet,
    uploadPatch,
    (_, next) => {
      log.info("Upload complete")
      return next()
    },
    onComplete
  )

  router.options("/", tusHeaders)

  return router
}
