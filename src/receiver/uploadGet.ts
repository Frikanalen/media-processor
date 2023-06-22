import type { Middleware } from "koa"
import { ResumableUpload } from "./ResumableUpload.js"
import type { AuthState } from "../middleware/authenticate.js"

export type GetUploadState = AuthState & {
  upload: ResumableUpload
}

export const uploadGet: Middleware<GetUploadState> = async (ctx, next) => {
  const { user } = ctx.state
  const { key } = ctx["params"]

  if (!key) return ctx.throw(400, "missing_key")

  const upload = await ResumableUpload.restore(key)

  if (!upload) return ctx.throw(410, "no_such_upload")
  if (user.id !== upload.user) return ctx.throw(403, "not_your_upload")

  ctx.state.upload = upload

  return next()
}
