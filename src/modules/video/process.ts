import { unlink } from "fs/promises"
import { getLocator } from "../media/helpers/getLocator"
import { getStorageWriteStream } from "../media/helpers/getStorageWriteStream"
import { grabStill } from "./helpers/grabStill"
import { getVideoDescriptors } from "./helpers/getVideoDescriptors"
import { desiredThumbnails } from "./helpers/thumbnailDescriptors"
import { VideoJob } from "./types"
import { log } from "../core/log"
import { MediaService } from "../../client"
import { FK_API_KEY } from "../core/constants"

export default async function process(job: VideoJob) {
  const { key, pathToVideo, mediaId } = job.data

  const finished = job.data.finished ?? []

  const pathToStill = job.data.pathToStill ?? (await makeStill(job))

  // Create thumbnail assets
  for (const d of desiredThumbnails()) {
    const { name, transcode, mime, width, height } = d

    const locator = getLocator("S3", "images", key, name)
    const writeStream = getStorageWriteStream(locator, mime)

    await transcode({
      onProgress: (progress) => {
        log.debug(`${progress}`)
      },
      pathToFile: pathToStill,
      write: writeStream,
    })

    await MediaService.postVideosMediaAssets(mediaId, FK_API_KEY, {
      type: name,
      metadata: { width, height },
      locator,
    })
  }

  // Filter out already finished descriptors
  const pendingAssets = getVideoDescriptors().filter(
    (d) => !finished.includes(d.name)
  )

  // Handle progress divided by how many transcoding jobs
  const handleProgress = (progress: number) => {
    job.progress(progress / pendingAssets.length)
  }

  // Map all transcoding jobs into a concurrent list of promises
  const transcodingProcesses = pendingAssets.map(async (d) => {
    const { name, transcode, mime } = d

    const locator = getLocator("S3", "videos", key, name)
    const writeStream = getStorageWriteStream(locator, mime)

    await transcode({
      onProgress: handleProgress,
      pathToFile: pathToVideo,
      write: writeStream,
    })

    await MediaService.postVideosMediaAssets(mediaId, FK_API_KEY, {
      type: name,
      metadata: {},
      locator,
    })

    finished.push(name)

    await job.update({ ...job.data, finished })
  })

  await Promise.allSettled(transcodingProcesses)

  await unlink(pathToVideo)
  await unlink(pathToStill)
}

const makeStill = async (job: VideoJob) => {
  const { pathToVideo, metadata } = job.data

  const { duration } = metadata.probed.format

  if (duration === undefined) {
    log.error(`File upload ${pathToVideo} has no duration!`)
  }

  const seek = Math.round(duration ?? 0 * 0.25)

  const pathToStill = await grabStill(pathToVideo, seek)

  await job.update({ ...job.data, pathToStill })

  return pathToStill
}
