import { ResumableUpload } from "../classes/ResumableUpload"
import { Middleware } from "koa"

export type SendUploadState = {
  upload: ResumableUpload
}

export const sendUpload = (): Middleware<SendUploadState> => async (context, next) => {
  const { upload } = context.state
  const { offset, length } = upload

  context.set("Upload-Offset", String(offset))
  context.set("Upload-Length", String(length))
  context.set("Cache-Control", "no-store")
  context.status = 200

  return next()
}
