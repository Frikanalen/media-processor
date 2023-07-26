import type { Middleware } from "koa"
import type { UploadHookState } from "../types"
import { UploadObjectSchema } from "../schema"
import { MEDIA_BUCKET, TEMP_UPLOAD_FOLDER } from "../../config"
import path from "path"

export const parseRequest: Middleware<UploadHookState> = async (ctx, next) => {
  try {
    const {
      Upload: {
        ID,
        MetaData,
        Storage: { Path },
      },
      HTTPRequest: { Header },
    } = await UploadObjectSchema.validate(ctx.request.body)

    if (!Path) return ctx.throw(500, "Invalid upload storage")

    if (!MetaData["filename"])
      return ctx.throw(500, "missing filename metadata")

    ctx.state.uploadId = ID
    ctx.state.Path = `${TEMP_UPLOAD_FOLDER}/${path.basename(Path)}`
    ctx.state.originalFilename = MetaData["filename"]
    ctx.state.locator = `S3:${MEDIA_BUCKET}:${ctx.state.uploadId}`
    ctx.state.cookie = Header["Cookie"]

    return next()
  } catch (error) {
    ctx.status = 400
    ctx.body = { message: error }
  }
}
