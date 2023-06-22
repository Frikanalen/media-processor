import Router from "@koa/router"
import { ingestVideo } from "../video/middleware/ingestVideo"
import { setTusHeaders } from "./setTusHeaders"
import { authenticate } from "../middleware/authenticate"
import { createUpload } from "./createUpload"
import { uploadGet } from "./uploadGet"
import { sendUpload } from "./sendUpload"
import { uploadPatch } from "./uploadPatch"
import { log } from "../log"
import type { Middleware } from "koa"

const logSuccess: Middleware = (_, next) => {
  log.info("Upload complete")
  return next()
}

const router = new Router()

router.post("/", authenticate({ required: true }), setTusHeaders, createUpload)

router.head(
  "/:key",
  authenticate({ required: true }),
  setTusHeaders,
  uploadGet,
  sendUpload
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
