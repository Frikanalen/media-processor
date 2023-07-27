import { getLocator } from "./helpers/getLocator.js"
import { ThumbnailDescriptors } from "./thumbnailDescriptors.js"
import type { VideoJob } from "./types.js"
import { log } from "../log.js"
import { MediaService } from "../generated/index.js"
import { FK_API_KEY } from "../config.js"
import fs from "fs"
import { s3Client } from "../s3Client.js"
import type { VideoTranscoder } from "./getVideoDescriptors.js"
import { VideoDescriptors } from "./getVideoDescriptors.js"
import type { Transcoder, TranscoderOutputFile } from "./transcode/types.js"
import { makeThumbnail } from "./makeThumbnail.js"
import { store } from "./helpers/store.js"
import { register } from "./helpers/register.js"
import { tempDir } from "./helpers/tempDir.js"
import { cleanupFiles } from "./helpers/cleanupFiles.js"
import assert from "assert"
import { makeStill } from "./makeStill.js"

export const Bucket = "media"

const handleSubfiles = async (
  subfiles: TranscoderOutputFile[],
  job: VideoJob,
  tempDir: string,
  type: string,
) => {
  const { mediaId, uploadId } = job.data

  await Promise.all(
    subfiles.flatMap(({ path, mime }) =>
      s3Client.putObject({
        Bucket,
        Key: `${uploadId}/${type}/${path}`,
        Body: fs.createReadStream(`${tempDir}/${path}`),
        ContentType: mime,
      }),
    ),
  )

  await MediaService.postVideosMediaAssets(mediaId, FK_API_KEY, {
    type,
    metadata: {},
    locator: getLocator("S3", Bucket, uploadId, "hls/manifest.m3u8"),
  })
}

const processAsset = async (
  outputFormat: VideoTranscoder,
  transcode: Transcoder,
  job: VideoJob,
) => {
  if (!job.id) throw new Error("Job has no ID")

  const { pathToVideo: inputPath, mediaId, uploadId } = job.data
  const outputDir = tempDir(uploadId, outputFormat)

  log.info(`Generating asset ${outputFormat}`, { uploadId })

  const { asset, subfiles } = await transcode({
    onProgress: (progress: number) =>
      updateProgress(job, outputFormat, progress),
    inputPath,
    outputDir,
  })

  await store(uploadId, outputFormat, asset)
  await register(uploadId, outputFormat, mediaId)

  if (subfiles) await handleSubfiles(subfiles, job, outputDir, outputFormat)

  fs.rmSync(outputDir, { recursive: true })
}

const makeThumbnails = async (job: VideoJob) => {
  const { mediaId, uploadId } = job.data
  log.debug(`Making thumbnails for ${mediaId} (${uploadId})`)
  if (!job.data.pathToStill) await makeStill(job)

  await Promise.all(
    Object.entries(ThumbnailDescriptors).map(
      async ([thumbType, dimensions]) => {
        try {
          await makeThumbnail(job, thumbType, dimensions)
        } catch (error) {
          log.error(`Error generating thumbnail ${thumbType}:`, error)
          throw error
        }
      },
    ),
  )
}

export const updateProgress = async (
  job: VideoJob,
  taskName: VideoTranscoder,
  percent: number,
) => {
  try {
    assert(
      percent >= 0 && percent <= 100,
      `Progress is ${percent}, must be between 0 and 100`,
    )
  } catch (error) {
    log.error(`Error updating progress for ${taskName}: ${error}`)
  }

  await job.updateData({
    ...job.data,
    progress: { ...job.data.progress, [taskName]: percent },
    finished:
      percent == 100 ? [...job.data.finished, taskName] : job.data.finished,
  })

  // Calculate average across all tasks
  const totalProgress =
    Object.values(job.data.progress).reduce((sum, curr) => sum + curr, 0) /
    Object.values(job.data.progress).length
  log.debug(`${taskName}: ${percent}% (total: ${totalProgress})`)

  await job.updateProgress(totalProgress)
}

export const process = async (job: VideoJob) => {
  const { pathToStill, pathToVideo, mediaId } = job.data
  const finished = job.data.finished ?? []

  log.info(`Processing start for mediaId ${mediaId}`)

  await makeThumbnails(job)

  // Filter out already finished descriptors
  const pendingAssets = VideoDescriptors.filter(
    ({ name }) => !finished.includes(name),
  )

  // Map all transcoding jobs into a list of promises
  await Promise.all(
    pendingAssets.map(async (transcodeSpec) => {
      const { name, transcode } = transcodeSpec
      try {
        await processAsset(name, transcode, job)
      } catch (error: any) {
        throw new Error(`Error generating asset ${name}: ${error.message}`)
      }
    }),
  )

  log.info(`Processing finished for mediaId ${mediaId}, cleaning up`)

  await cleanupFiles([pathToVideo, pathToStill!])
}
