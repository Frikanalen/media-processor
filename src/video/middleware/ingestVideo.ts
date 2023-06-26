import { createReadStream } from "fs"
import type { Middleware } from "koa"
import { getLocator } from "../getLocator.js"
import type { PatchUploadState } from "../../upload/tus/uploadPatch.js"
import { getVideoMetadata } from "../helpers/getVideoMetadata.js"
import type { VideoMetadataV2 } from "../helpers/getVideoMetadata.js"
import { videoQueue } from "../queue.js"
import { FK_API_KEY } from "../../constants.js"
import { MediaService } from "../../generated/index.js"
import { log } from "../../log.js"
import { Upload } from "@aws-sdk/lib-storage"
import { s3Client } from "../../s3Client.js"
import { randomBytes } from "crypto"

export const makeVideoKey = () => randomBytes(16).toString("hex")
// TODO: This would probably be better solved by using tusd, storing directly to S3
//   and then calling an endpoint in media-processor to get metadata/acceptance.
export const ingestVideo: Middleware<PatchUploadState> = async (ctx, next) => {
  const { upload } = ctx.state

  log.info("Upload complete")

  let metadata: VideoMetadataV2

  try {
    metadata = await getVideoMetadata(upload.path)
  } catch {
    return ctx.throw(400, "Invalid file")
  }

  const duration = metadata.probed.format.duration

  if (duration === undefined)
    return ctx.throw(400, "Invalid file: duration is missing")

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

  log.info("Registering file on backend")

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

  ctx.body = { mediaId, jobId }

  log.info(`ingestVideo ctx.body = ${JSON.stringify(ctx.body)}`)

  log.info(`Created job ${jobId} for media ${mediaId}`)

  return next()
}
