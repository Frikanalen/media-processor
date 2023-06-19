import { createReadStream } from "fs"
import type { Middleware } from "koa"
import { HttpError } from "../../core/HttpError"
import { getLocator } from "../../media/getLocator"
import type { PatchUploadState } from "../../receiver/patchUpload"
import { makeVideoKey } from "../helpers/makeVideoKey"
import { getVideoMetadata } from "../helpers/getVideoMetadata"
import { videoQueue } from "../queue"
import { FK_API_KEY } from "../../core/constants"
import { MediaService } from "../../generated"
import { log } from "../../core/log"
import { Upload } from "@aws-sdk/lib-storage"
import { s3Client } from "../../core/s3Client"

const getMetadataOrThrow400 = async (path: string) => {
  try {
    const metadata = await getVideoMetadata(path)

    // Despite the typings, "duration" comes back as "N/A" if it's an image
    if ((metadata.probed.format.duration! as unknown as string) === "N/A")
      throw new Error()

    return metadata
  } catch {
    throw new HttpError(400, "Invalid file")
  }
}

// TODO: This would probably be better solved by using tusd, storing directly to S3
//   and then calling an endpoint in media-processor to get metadata/acceptance.
export const ingestVideo =
  (): Middleware<PatchUploadState> => async (context, next) => {
    const { upload } = context.state

    const metadata = await getMetadataOrThrow400(upload.path)
    const duration = metadata.probed.format.duration

    if (duration === undefined)
      throw new HttpError(400, "Invalid file: duration is missing")

    const Body = createReadStream(upload.path)
    const Bucket = "media"
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