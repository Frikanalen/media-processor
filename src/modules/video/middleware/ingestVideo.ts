import { createReadStream } from "fs"
import { Middleware } from "koa"
import { HttpError } from "../../core/classes/HttpError"
import { getLocator } from "../../media/helpers/getLocator"
import { PatchUploadState } from "../../tus/middleware/patchUpload"
import { makeVideoKey } from "../helpers/makeVideoKey"
import { getVideoMetadata } from "../helpers/getVideoMetadata"
import { videoQueue } from "../queue"
import { FK_API_KEY } from "../../core/constants"
import { MediaService } from "../../../client"
import { log } from "../../core/log"
import { Upload } from "@aws-sdk/lib-storage"
import { s3Client } from "../../s3/client"

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

    const Body = createReadStream(upload.path)
    const Bucket = "videos"
    const Key = makeVideoKey()

    log.info(`Copying file to S3 as ${Bucket}/${Key}`)

    const originalUpload = new Upload({
      client: s3Client,
      params: {
        Body,
        Bucket,
        Key,
        ContentType: metadata.mime,
      },
    })

    await originalUpload.done()

    log.info("upload complete; registering file on backend")

    const originalLocator = getLocator("S3", Bucket, Key, "original")

    const { id: mediaId } = await MediaService.postVideosMedia(FK_API_KEY, {
      locator: originalLocator,
      fileName: upload.filename,
      duration,
      metadata,
    })

    const { id: jobIdRaw } = await videoQueue.add({
      pathToVideo: upload.path,
      mediaId,
      metadata,
      key: Key,
    })

    const jobId = typeof jobIdRaw === "string" ? parseInt(jobIdRaw) : jobIdRaw

    context.body = { mediaId, jobId }

    log.info(`Created job ${jobId} for media ${mediaId}`)

    return next()
  }
