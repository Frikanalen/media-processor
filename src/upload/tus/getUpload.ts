import type { Middleware } from "koa"
import { ResumableUpload } from "../redis/ResumableUpload"
import type { AuthState } from "../../middleware/authenticate"

export type GetUploadState = AuthState & {
  upload: ResumableUpload
}

/** Fetches an upload in progress from Redis **/
export const getUpload: Middleware<GetUploadState> = async (ctx, next) => {
  const user = ctx.state.user.id
  const { key } = ctx["params"]

  if (!key) return ctx.throw(400, "missing_key")

  const upload = await ResumableUpload.restore(key)

  if (!upload) return ctx.throw(410, "no_such_upload")

  if (user !== upload.user) return ctx.throw(403, "not_your_upload")

  ctx.state.upload = upload

  return next()
}
