import { Middleware } from "koa"
import { TUS_MAX_SIZE_DEFAULT } from "../constants"
import { HttpError } from "../../core/classes/HttpError"
import { ResumableUpload } from "../classes/ResumableUpload"
import { parseMetadata } from "../helpers/parseMetadata"
import { AuthState } from "../../auth/middleware/authenticate"

export type CreateUploadOptions = {
  maxSize?: number
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

    if (length > maxSize) {
      throw new HttpError(400, `Max size is ${maxSize} bytes`)
    }

    if (!length) {
      throw new HttpError(400, `Length is required`)
    }

    if (!type) throw new Error("Type is required")

    const { filename = "unnamed", ...rest } = metadata

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
