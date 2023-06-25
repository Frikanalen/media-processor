import Router from "@koa/router"
import { ingestVideo } from "../video/middleware/ingestVideo.js"
import { authenticate } from "../middleware/authenticate.js"
import { uploadCreate } from "./tus/uploadCreate.js"
import { uploadGet } from "./tus/uploadGet.js"
import { uploadSend } from "./tus/uploadSend.js"
import { uploadPatch } from "./tus/uploadPatch.js"
import { log } from "../log.js"
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

const logSuccess: Middleware = (_, next) => {
  log.info("Upload complete")
  return next()
}

const router = new Router()

router.post("/", authenticate({ required: true }), setTusHeaders, uploadCreate)

router.head(
  "/:key",
  authenticate({ required: true }),
  setTusHeaders,
  uploadGet,
  uploadSend
)

router.patch(
  "/:key",
  authenticate({ required: true }),
  uploadGet,
  uploadPatch,
  logSuccess,
  ingestVideo
)

router.options("/", setTusHeaders)

export { router as videoRouter }
