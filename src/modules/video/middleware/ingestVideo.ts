import { createReadStream } from "fs"
import { Middleware } from "koa"
import { HttpError } from "../../core/classes/HttpError"
import { createVideoMedia } from "../helpers/createVideoMedia"
import { getLocator } from "../../media/helpers/getLocator"
import { getStorageWriteStream } from "../../media/helpers/getStorageWriteStream"
import { PatchUploadState } from "../../tus/middleware/patchUpload"
import { getVideoKey } from "../helpers/getVideoKey"
import { getVideoMetadata, VideoMetadata } from "../helpers/getVideoMetadata"

import stream from "stream/promises"
import { videoQueue } from "../queue"

export const ingestVideo =
  (): Middleware<PatchUploadState> => async (context, next) => {
    const { upload } = context.state

    let metadata: VideoMetadata

    try {
      metadata = await getVideoMetadata(upload.path)
    } catch {
      throw new HttpError(400, "Invalid file")
    }

    const duration = metadata.probed.format.duration!
    const key = getVideoKey()

    const originalLocator = getLocator("S3", "videos", key, "original")

    const writeStream = getStorageWriteStream(originalLocator, metadata.mime)
    const readStream = createReadStream(upload.path)

    await stream.pipeline(readStream, writeStream)

    const { id } = await createVideoMedia({
      locator: originalLocator,
      fileName: upload.filename,
      duration,
      metadata,
    })

    const job = await videoQueue.add({
      pathToVideo: upload.path,
      mediaId: id,
      metadata,
      key,
    })

    context.body = { id, job: job.id }
    return next()
  }
