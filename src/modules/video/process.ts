import { unlink } from "fs/promises"
import { getLocator } from "../media/helpers/getLocator.js"
import { grabStill } from "./helpers/grabStill"
import { getVideoDescriptors } from "./helpers/getVideoDescriptors"
import { desiredThumbnails } from "./helpers/thumbnailDescriptors"
import type { VideoJob } from "./types"
import { log } from "../core/log.js"
import { MediaService } from "../../client"
import { FK_API_KEY } from "../core/constants.js"
import fs from "fs"
import { s3Client } from "../s3/client"

export const process = async (job: VideoJob) => {
  const bucket = "media"
  const { key, pathToVideo, mediaId } = job.data
  const finished = job.data.finished ?? []

  log.info(`Processing start for mediaId ${mediaId}`)

  const pathToStill = job.data.pathToStill ?? (await makeStill(job))

  // Create thumbnail assets
  for (const target of desiredThumbnails()) {
    const { name, transcode, mime, width, height } = target
    const tempFileName = `tmp-upload/${job.id}_${name}`

    log.info(`Generating thumbnail ${name}`)

    const writeStream = await fs.createWriteStream(tempFileName)
    await transcode({
      onProgress: (progress) => {
        log.debug(`${progress}%`)
      },
      pathToFile: pathToStill,
      write: writeStream,
    })
    await writeStream.close()

    await s3Client.putObject({
      Bucket: bucket,
      Key: `${key}/${name}`,
      Body: await fs.createReadStream(tempFileName),
      ContentType: mime,
    })

    await fs.unlinkSync(tempFileName)

    await MediaService.postVideosMediaAssets(mediaId, FK_API_KEY, {
      type: name,
      metadata: { width, height },
      locator: getLocator("S3", bucket, key, name),
    })
  }

  // Filter out already finished descriptors
  const pendingAssets = getVideoDescriptors().filter(
    (d) => !finished.includes(d.name)
  )

  // Handle progress divided by how many transcoding jobs
  const handleProgress = (progress: number) => {
    log.debug(progress)
    // FIXME: This isn't right at all...
    job.progress(progress / pendingAssets.length)
  }

  // Map all transcoding jobs into a concurrent list of promises
  const transcodingProcesses = pendingAssets.map(
    async ({ name, transcode, mime }) => {
      const tempFileName = `tmp-upload/${job.id}_${name}`
      log.info(`Generating asset ${name}`)

      const writeStream = await fs.createWriteStream(tempFileName)

      await transcode({
        onProgress: handleProgress,
        pathToFile: pathToVideo,
        write: writeStream,
      })
      await writeStream.close()

      await s3Client.putObject({
        Bucket: bucket,
        Key: `${key}/${name}`,
        Body: await fs.createReadStream(tempFileName),
        ContentType: mime,
      })

      await fs.unlinkSync(tempFileName)

      await MediaService.postVideosMediaAssets(mediaId, FK_API_KEY, {
        type: name,
        metadata: {},
        locator: getLocator("S3", "media", key, name),
      })

      finished.push(name)

      await job.update({ ...job.data, finished })
    }
  )

  await Promise.allSettled(transcodingProcesses)

  log.info(`Processing finished for mediaId ${mediaId}, cleaning up`)

  await unlink(pathToVideo)
  await unlink(pathToStill)
}

const makeStill = async (job: VideoJob) => {
  const { pathToVideo, metadata } = job.data

  const { duration } = metadata.probed.format

  if (duration === undefined) {
    log.error(`File upload ${pathToVideo} has no duration!`)
  }

  const seek = Math.floor((duration ?? 0) * 0.25)

  const pathToStill = await grabStill(pathToVideo, seek)

  await job.update({ ...job.data, pathToStill })

  return pathToStill
}
