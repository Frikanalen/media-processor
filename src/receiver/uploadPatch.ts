import type { ResumableUpload } from "./ResumableUpload.js"
import type { Middleware } from "koa"
import { HttpError } from "../HttpError.js"

export type PatchUploadState = {
  upload: ResumableUpload
}

export const uploadPatch =
  (): Middleware<PatchUploadState> => async (context, next) => {
    const { upload } = context.state

    const offset = Number(context.get("Upload-Offset"))

    if (offset !== upload.offset || isNaN(offset)) {
      throw new HttpError(400, "Invalid offset")
    }

    await upload.writeToFile(context.req)

    context.set("Upload-Offset", String(upload.offset))
    context.set("Upload-Length", String(upload.length))

    if (upload.finished) return next()

    context.status = 204
  }
