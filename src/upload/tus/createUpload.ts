import type { Middleware } from "koa"
import { ResumableUpload } from "../redis/ResumableUpload"
import type { AuthState } from "../../middleware/authenticate"
import { log } from "../../log"
import { TUS_MAX_SIZE } from "../router"

export type CreateUploadState = AuthState & {
  upload: ResumableUpload
}

const parseMetadata = (metadata: string): Record<string, string> => {
  const result: any = {}
  const rows = metadata.split(",")

  for (const row of rows) {
    const [key, rawValue] = row.split(" ") as [string, string]

    result[key] = Buffer.from(rawValue, "base64").toString("ascii")
  }

  return result
}
export const createUpload: Middleware<CreateUploadState> = async (
  ctx,
  next
) => {
  const user = ctx.state.user.id
  const length = Number(ctx.get("Upload-Length"))

  if (length > TUS_MAX_SIZE)
    return ctx.throw(400, "too_large", { maxSize: TUS_MAX_SIZE })
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
