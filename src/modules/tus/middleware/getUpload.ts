import type { Middleware } from "koa"
import { ResumableUpload } from "../classes/ResumableUpload.js"
import { HttpError } from "../../core/HttpError"
import type { AuthState } from "../../core/middleware/authenticate"

export type GetUploadState = AuthState & {
  upload: ResumableUpload
}

export const getUpload =
  (type: string): Middleware<GetUploadState> =>
  async (context, next) => {
    const { user } = context.state
    const { key } = context["params"]

    if (!key) throw new HttpError(400, 'Must supply "key"')

    const upload = await ResumableUpload.restore(key)

    if (!upload || user.id !== upload.user || upload.type !== type) {
      throw new HttpError(404, "could not resume upload")
    }

    context.state.upload = upload
    return next()
  }
