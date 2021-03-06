import { Middleware } from "koa"
import { ResumableUpload } from "../classes/ResumableUpload"
import { HttpError } from "../../core/classes/HttpError"

export type PatchUploadState = {
  upload: ResumableUpload
}

export const patchUpload =
  (): Middleware<PatchUploadState> => async (context, next) => {
    const { upload } = context.state

    const offset = Number(context.get("Upload-Offset"))

    if (offset !== upload.offset || isNaN(offset)) {
      throw new HttpError(400, "Invalid offset")
    }

    await upload.writeToFile(context.req)

    context.set("Upload-Offset", String(upload.offset))
    context.set("Upload-Length", String(upload.length))

    if (upload.finished) {
      return next()
    }

    context.status = 204
  }
