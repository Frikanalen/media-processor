import { getLocator } from "./helpers/getLocator"
import { grabStill } from "./grabStill.js"
import { ThumbnailDescriptors } from "./thumbnailDescriptors.js"
import type { VideoJob } from "./types.js"
import { log } from "../log.js"
import { MediaService } from "../generated/index.js"
import { FK_API_KEY } from "../config"
import fs from "fs"
import { s3Client } from "../s3Client.js"
import type { VideoTranscoder } from "./getVideoDescriptors.js"
import { VideoDescriptors } from "./getVideoDescriptors.js"
import type { Transcoder, TranscoderOutputFile } from "./transcode/types.js"
import { makeThumbnail } from "./makeThumbnail"
import { store } from "./helpers/store"
import { register } from "./helpers/register"
import { tempDir } from "./helpers/tempDir"
import { cleanupFiles } from "./helpers/cleanupFiles"

export const Bucket = "media"

const uploadAndRegisterSubfiles = async (
  subfiles: TranscoderOutputFile[],
  job: VideoJob,
  tempDir: string,
  type: string,
) => {
  const { mediaId, uploadId } = job.data

  const substreams = subfiles.flatMap(({ path, mime }) =>
    s3Client.putObject({
      Bucket,
      Key: `${uploadId}/${type}/${path}`,
      Body: fs.createReadStream(`${tempDir}/${path}`),
      ContentType: mime,
    }),
  )

  await Promise.all(substreams)

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
  onProgress: (progress: number) => void,
) => {
  if (!job.id) throw new Error("Job has no ID")

  const { pathToVideo: inputPath, mediaId, uploadId } = job.data
  const outputDir = tempDir(uploadId, outputFormat)

  log.info(`Generating asset ${outputFormat}`, { uploadId })

  const { asset, subfiles } = await transcode({
    onProgress,
    inputPath,
    outputDir,
  })

  await store(uploadId, outputFormat, asset)
  await register(uploadId, outputFormat, mediaId)

  if (subfiles)
    await uploadAndRegisterSubfiles(subfiles, job, outputDir, outputFormat)

  fs.rmSync(outputDir, { recursive: true })
}

const handleProgress = async (
  progress: number,
  assetIndex: number,
  assetProgress: number[],
  job: VideoJob,
) => {
  // Update the progress of the specific asset
  assetProgress[assetIndex] = progress

  // Average progress of all assets
  const totalProgress =
    assetProgress.reduce((sum, curr) => sum + curr, 0) / assetProgress.length

  // Update the job progress
  await job.updateProgress(totalProgress)
}

const makeThumbnails = async (job: VideoJob) => {
  if (!job.data.pathToStill) job.data.pathToStill = await makeStill(job)

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
export const process = async (job: VideoJob) => {
  try {
    const { pathToStill, pathToVideo, mediaId } = job.data
    const finished = job.data.finished ?? []

    log.info(`Processing start for mediaId ${mediaId}`)

    await makeThumbnails(job)

    // Filter out already finished descriptors
    const pendingAssets = VideoDescriptors.filter(
      ({ name }) => !finished.includes(name),
    )

    const assetProgress: number[] = new Array(pendingAssets.length).fill(0)

    // Map all transcoding jobs into a concurrent list of promises
    const transcodingProcesses = pendingAssets.map(
      async ({ name, transcode }, assetIndex) => {
        try {
          await processAsset(name, transcode, job, (progress: number) =>
            handleProgress(progress, assetIndex, assetProgress, job),
          )

          finished.push(name)

          await job.updateData({ ...job.data, finished })
        } catch (error: any) {
          log.error(`Error generating asset ${name}:`, error)
          await job.updateData({
            ...job.data,
            error: `Error generating asset ${name}: ${error.message}`,
          })
          throw error
        }
      },
    )

    await Promise.all(transcodingProcesses)

    log.info(`Processing finished for mediaId ${mediaId}, cleaning up`)

    await cleanupFiles([pathToVideo, pathToStill!])
  } catch (error: any) {
    log.error(`Error processing job for mediaId ${job.data.mediaId}:`, error)
    await job.updateData({
      ...job.data,
      error: `Error processing job for mediaId ${job.data.mediaId}: ${error.message}`,
    })
    throw error
  }
}
const makeStill = async (job: VideoJob) => {
  const { pathToVideo, metadata } = job.data

  const { duration } = metadata.probed.format

  if (duration === undefined) {
    log.error(`File upload ${pathToVideo} has no duration!`)
  }

  const seek = Math.floor((duration ?? 0) * 0.3333)

  const pathToStill = await grabStill(pathToVideo, seek)
  await job.updateData({ ...job.data, pathToStill })

  return pathToStill
}
