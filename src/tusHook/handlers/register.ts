import type { Middleware } from "koa"
import type { UploadHookState } from "../types.js"
import { log } from "../../log.js"
import { registerMedia } from "../helpers/registerMedia.js"

// Register the received and validated file in the database
export const register: Middleware<UploadHookState> = async (ctx, next) => {
  const { locator, originalFilename, metadata, uploadId } = ctx.state
  log.info(`Registering ${locator} in database`, { uploadId })
  ctx.state.mediaId = await registerMedia(locator, originalFilename, metadata)
  return next()
}
