import type { ResumableUpload } from "./ResumableUpload.js"
import type { Middleware } from "koa"

export type PatchUploadState = {
  upload: ResumableUpload
}

export const uploadPatch: Middleware<PatchUploadState> = async (ctx, next) => {
  const { upload } = ctx.state

  const offset = Number(ctx.get("Upload-Offset"))

  if (offset !== upload.offset || isNaN(offset))
    return ctx.throw(400, "invalid_offset")

  await upload.writeToFile(ctx.req)

  ctx.set("Upload-Offset", String(upload.offset))
  ctx.set("Upload-Length", String(upload.length))

  if (upload.finished) return next()

  ctx.status = 204
}
