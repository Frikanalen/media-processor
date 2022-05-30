import { createReadStream } from "fs"
import { Middleware } from "koa"
import { HttpError } from "../../core/classes/HttpError"
import { getLocator } from "../../media/helpers/getLocator"
import { getStorageWriteStream } from "../../media/helpers/getStorageWriteStream"
import { PatchUploadState } from "../../tus/middleware/patchUpload"
import { makeVideoKey } from "../helpers/makeVideoKey"
import { getVideoMetadata } from "../helpers/getVideoMetadata"

import stream from "stream/promises"
import { videoQueue } from "../queue"
import { FK_API_KEY } from "../../core/constants"
import { MediaService } from "../../../client"
import { log } from "../../core/log"

const getMetadataOrThrow400 = async (path: string) => {
  try {
    return await getVideoMetadata(path)
  } catch {
    throw new HttpError(400, "Invalid file")
  }
}

export const ingestVideo =
  (): Middleware<PatchUploadState> => async (context, next) => {
    const { upload } = context.state

    const metadata = await getMetadataOrThrow400(upload.path)
    const duration = metadata.probed.format.duration!
    const key = makeVideoKey()

    log.info("Copying file to S3 backend")

    const originalLocator = getLocator("S3", "videos", key, "original")

    const writeStream = getStorageWriteStream(originalLocator, metadata.mime)
    const readStream = createReadStream(upload.path)

    await stream.pipeline(readStream, writeStream)

    log.info("Registering new file on backend")

    const { id } = await MediaService.postVideosMedia(FK_API_KEY, {
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
