import type { ResumableUpload } from "../redis/ResumableUpload.js"
import type { Middleware } from "koa"

export type SendUploadState = {
  upload: ResumableUpload
}

export const uploadSend: Middleware<SendUploadState> = async (ctx, next) => {
  const { upload } = ctx.state
  const { offset, length } = upload

  ctx.set("Upload-Offset", String(offset))
  ctx.set("Upload-Length", String(length))
  ctx.set("Cache-Control", "no-store")
  ctx.status = 200

  return next()
}
