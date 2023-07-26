import type { Middleware } from "koa"
import type { UploadHookState } from "../types"
import { videoQueue } from "../../video/queue"
import { log } from "../../log"

// Begin an ingest job for the uploaded file to generate secondary assets
export const ingest: Middleware<UploadHookState> = async (ctx, next) => {
  const { Path, mediaId, metadata, uploadId, user } = ctx.state

  const { id: jobId } = await videoQueue.add(
    ctx.state.uploadId,
    {
      pathToVideo: Path,
      mediaId,
      metadata,
      uploadId: uploadId,
      progress: {},
      finished: [],
      userId: user.id,
    },
    {
      jobId: uploadId,
    },
  )

  log.info(`Created ingest job ${jobId} for media #${mediaId} ${Path}`, {
    uploadId,
  })

  ctx.status = 200
  ctx.body = { message: "OK" }
  return next()
}
