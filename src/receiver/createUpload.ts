import type { Middleware } from "koa"
import { HttpError } from "../HttpError.js"
import { ResumableUpload } from "./ResumableUpload.js"
import { parseMetadata } from "./parseMetadata.js"
import type { AuthState } from "../middleware/authenticate.js"
import { log } from "../log.js"
import { TUS_MAX_SIZE_DEFAULT } from "./setTusHeaders.js"

export type CreateUploadOptions = {
  maxSize: number | undefined
  type?: string
}

export type CreateUploadState = AuthState & {
  upload: ResumableUpload
  type: string
}

export const createUpload =
  (options: CreateUploadOptions): Middleware<CreateUploadState> =>
  async (context, next) => {
    const { maxSize = TUS_MAX_SIZE_DEFAULT, type } = options
    const { user } = context.state

    const length = Number(context.get("Upload-Length"))
    const metadata = parseMetadata(context.get("Upload-Metadata") || "")

    if (length > maxSize)
      throw new HttpError(400, `Max size is ${maxSize} bytes`)

    if (!length) throw new HttpError(400, `Length is required`)

    if (!type) throw new Error("Type is required")

    const { filename = "unnamed", ...rest } = metadata

    log.info(
      `Got ${(length / 1024 / 1024).toFixed(2)}MiB upload from ${user.id}`
    )
    const upload = await ResumableUpload.create({
      user: user.id,
      metadata: rest,
      filename,
      length,
      type,
    })

    context.set("Location", `${upload.type}/${upload.key}`)
    context.status = 201
    context.state.upload = upload

    return next()
  }
