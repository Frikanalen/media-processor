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
import type { ResumableUpload } from "../../upload/redis/ResumableUpload.js"

export const makeVideoKey = () => randomBytes(16).toString("hex")
// TODO: This would probably be better solved by using tusd, storing directly to S3
//   and then calling an endpoint in media-processor to get metadata/acceptance.
async function uploadVideo(path: string, Key: string, mime: string) {
  const Bucket = "media"

  log.info(`Copying file to S3 as ${Bucket}/${Key}`)

  const params = {
    Body: createReadStream(path),
    Bucket,
    Key,
    ContentType: mime,
  }

  const originalUpload = new Upload({
    client: s3Client,
    params,
  })

  await originalUpload.done()

  log.debug("Upload complete")

  return getLocator("S3", params.Bucket, Key, "original")
}

async function registerMedia(
  originalLocator: `S3:${string}` | `CLOUDFLARE:${string}`,
  upload: ResumableUpload,
  metadata: VideoMetadataV2
) {
  log.info("Registering file on backend")

  const { id } = await MediaService.postVideosMedia(FK_API_KEY, {
    locator: originalLocator,
    fileName: upload.filename,
    duration: metadata.duration,
    metadata,
  })

  return id
}

async function createJob(
  upload: ResumableUpload,
  mediaId: number,
  metadata: VideoMetadataV2,
  Key: string
) {
  const { id: jobIdRaw } = await videoQueue.add({
    pathToVideo: upload.path,
    mediaId,
    metadata,
    key: Key,
  })

  log.debug(`bull jobId = "${jobIdRaw}" (${typeof jobIdRaw})`)

  return typeof jobIdRaw === "string" ? parseInt(jobIdRaw) : jobIdRaw
}

export const ingestVideo: Middleware<PatchUploadState> = async (ctx, next) => {
  const { upload } = ctx.state
  const Key = makeVideoKey()

  log.info("Upload from client complete")

  const metadata = await getVideoMetadata(upload.path)
  if (!metadata) return ctx.throw(400, "Invalid file")

  const originalLocator = await uploadVideo(upload.path, Key, metadata.mime)

  const mediaId = await registerMedia(originalLocator, upload, metadata)
  const jobId = await createJob(upload, mediaId, metadata, Key)

  ctx.body = { mediaId, jobId }

  log.debug(`ingestVideo ctx.body = ${JSON.stringify(ctx.body)}`)

  log.info(`Created job ${jobId} for media ${mediaId}`)

  return next()
}
