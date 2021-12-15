import { Middleware } from "koa"
import { ResumableUpload } from "../classes/ResumableUpload"
import { HttpError } from "../../core/classes/HttpError"
import { AuthState } from "../../auth/middleware/authenticate"

export type GetUploadState = AuthState & {
  upload: ResumableUpload
}

export const getUpload =
  (type: string): Middleware<GetUploadState> =>
  async (context, next) => {
    const { user } = context.state

    const { key } = context.params
    if (!key) throw new HttpError(400)

    const upload = await ResumableUpload.restore(key)

    if (!upload || user.id !== upload.user || upload.type !== type) {
      throw new HttpError(404)
    }

    context.state.upload = upload
    return next()
  }
