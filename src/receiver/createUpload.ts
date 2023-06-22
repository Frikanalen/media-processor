import type { Middleware } from "koa"
import { ResumableUpload } from "./ResumableUpload.js"
import { parseMetadata } from "./parseMetadata.js"
import type { AuthState } from "../middleware/authenticate.js"
import { log } from "../log.js"
import { TUS_MAX_SIZE_DEFAULT } from "./setTusHeaders.js"

export type CreateUploadOptions = {
  maxSize: number | undefined
}

export type CreateUploadState = AuthState & {
  upload: ResumableUpload
}

export const createUpload =
  (options: CreateUploadOptions): Middleware<CreateUploadState> =>
  async (ctx, next) => {
    const { maxSize = TUS_MAX_SIZE_DEFAULT } = options
    const user = ctx.state.user.id
    const length = Number(ctx.get("Upload-Length"))

    if (length > maxSize) return ctx.throw(400, "too_large", { maxSize })
    if (!length) return ctx.throw(400, `length_required`)

    const { filename = "unnamed", ...metadata } = parseMetadata(
      ctx.get("Upload-Metadata")
    )

    log.info(`Got ${(length / 1048576).toFixed(2)}MiB upload from ${user}`)

    const upload = await ResumableUpload.create({
      user,
      metadata,
      filename,
      length,
    })

    ctx.set("Location", `video/${upload.key}`)
    ctx.status = 201
    ctx.state.upload = upload

    return next()
  }
