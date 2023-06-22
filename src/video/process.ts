import { unlink } from "fs/promises"
import { getLocator } from "../media/getLocator.js"
import { grabStill } from "./helpers/grabStill.js"
import { ThumbnailDescriptors } from "./helpers/thumbnailDescriptors.js"
import type { VideoJob } from "./types.js"
import { log } from "../log.js"
import { MediaService } from "../generated/index.js"
import { FK_API_KEY } from "../constants.js"
import fs from "fs"
import { s3Client } from "../s3Client.js"
import { VideoDescriptors } from "./helpers/getVideoDescriptors.js"
import { toWebP } from "../transcode/toWebP.js"
import type { TranscoderOutputFile } from "../transcode/types.js"

const makeThumbnails = (job: VideoJob) =>
  Object.entries(ThumbnailDescriptors).map(
    async ([name, { width, height }]) => {
      try {
        const bucket = "media"
        const { key, pathToStill, mediaId } = job.data
        const outputDir = `tmp-upload/${job.id}_${name}`

        fs.mkdirSync(outputDir)

        log.info(`Generating thumbnail ${name}`)

        const result = await toWebP({
          onProgress: (progress) => {
            log.debug(`${progress}%`)
          },
          inputPath: pathToStill!,
          outputDir,
          width,
          height,
        })

        await s3Client.putObject({
          Bucket: bucket,
          Key: `${key}/${name}`,
          Body: await fs.createReadStream(result.asset.path),
          ContentType: result.asset.mime,
        })

        await fs.rmSync(outputDir, { recursive: true })

        await MediaService.postVideosMediaAssets(mediaId, FK_API_KEY, {
          type: name,
          metadata: { width, height },
          locator: getLocator("S3", bucket, key, name),
        })
      } catch (error) {
        log.error(`Error generating thumbnail ${name}:`, error)
        throw error
      }
    }
  )

const uploadAndRegisterAsset = async (
  asset: TranscoderOutputFile,
  mediaId: number,
  name: string,
  bucket: string,
  key: string
) => {
  await s3Client.putObject({
    Bucket: bucket,
    Key: `${key}/${name}`,
    Body: await fs.createReadStream(asset.path),
    ContentType: asset.mime,
  })

  await MediaService.postVideosMediaAssets(mediaId, FK_API_KEY, {
    type: name,
    metadata: {},
    locator: getLocator("S3", "media", key, name),
  })
}

const uploadAndRegisterSubfiles = async (
  subfiles: TranscoderOutputFile[],
  tempDir: string,
  mediaId: number,
  name: string,
  bucket: string,
  key: string
) => {
  const substreams = subfiles.flatMap((segment) =>
    s3Client.putObject({
      Bucket: bucket,
      Key: `${key}/${name}/${segment.path}`,
      Body: fs.createReadStream(`${tempDir}/${segment.path}`),
      ContentType: segment.mime,
    })
  )

  await Promise.all(substreams)

  await MediaService.postVideosMediaAssets(mediaId, FK_API_KEY, {
    type: name,
    metadata: {},
    locator: getLocator("S3", "media", key, "hls/manifest.m3u8"),
  })
}

export const process = async (job: VideoJob) => {
  try {
    const bucket = "media"
    const { key, pathToVideo, mediaId } = job.data
    const finished = job.data.finished ?? []

    log.info(`Processing start for mediaId ${mediaId}`)

    const pathToStill = job.data.pathToStill ?? (await makeStill(job))

    await Promise.all(makeThumbnails(job))

    // Filter out already finished descriptors
    const pendingAssets = VideoDescriptors.filter(
      ({ name }) => !finished.includes(name)
    )

    const assetProgress: number[] = new Array(pendingAssets.length).fill(0)

    const handleProgress = (progress: number, assetIndex: number) => {
      // Update the progress of the specific asset
      assetProgress[assetIndex] = progress

      // Calculate the average progress of all assets
      const totalProgress =
        assetProgress.reduce((sum, curr) => sum + curr, 0) /
        pendingAssets.length

      // Update the job progress
      job.progress(totalProgress)
    }

    // Map all transcoding jobs into a concurrent list of promises
    const transcodingProcesses = pendingAssets.map(
      async ({ name, transcode }, assetIndex) => {
        try {
          const tempDir = `tmp-upload/${job.id}_${name}`

          fs.mkdirSync(tempDir)

          log.info(`Generating asset ${name}`)

          const { asset, subfiles } = await transcode({
            onProgress: (progress) => handleProgress(progress, assetIndex),
            inputPath: pathToVideo,
            outputDir: tempDir,
          })

          await uploadAndRegisterAsset(asset, mediaId, name, bucket, key)

          if (subfiles) {
            await uploadAndRegisterSubfiles(
              subfiles,
              tempDir,
              mediaId,
              name,
              bucket,
              key
            )
          }

          fs.rmSync(tempDir, { recursive: true })

          finished.push(name)

          await job.update({ ...job.data, finished })
        } catch (error: any) {
          log.error(`Error generating asset ${name}:`, error)
          await job.update({
            ...job.data,
            error: `Error generating asset ${name}: ${error.message}`,
          })
          throw error
        }
      }
    )

    await Promise.all(transcodingProcesses)

    log.info(`Processing finished for mediaId ${mediaId}, cleaning up`)

    await unlink(pathToVideo)
    await unlink(pathToStill)
  } catch (error: any) {
    log.error(`Error processing job for mediaId ${job.data.mediaId}:`, error)
    await job.update({
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
  console.log("done", pathToStill)
  await job.update({ ...job.data, pathToStill })

  return pathToStill
}
