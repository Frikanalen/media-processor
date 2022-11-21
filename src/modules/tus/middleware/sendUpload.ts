import type { ResumableUpload } from "../classes/ResumableUpload.js"
import type { Middleware } from "koa"

export type SendUploadState = {
  upload: ResumableUpload
}

export const sendUpload =
  (): Middleware<SendUploadState> => async (context, next) => {
    const { upload } = context.state
    const { offset, length } = upload

    context.set("Upload-Offset", String(offset))
    context.set("Upload-Length", String(length))
    context.set("Cache-Control", "no-store")
    context.status = 200

    return next()
  }
