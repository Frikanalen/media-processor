import type { Middleware } from "koa"
import { ResumableUpload } from "./ResumableUpload.js"
import { HttpError } from "../HttpError.js"
import type { AuthState } from "../middleware/authenticate.js"

export type GetUploadState = AuthState & {
  upload: ResumableUpload
}

export const uploadGet =
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
