import { createReadStream } from "fs"
import { getLocator } from "../media/helpers/getLocator"
import { getStorageWriteStream } from "../media/helpers/getStorageWriteStream"
import { createThumbnail } from "./helpers/createThumbnail"
import { createVideoMediaAsset } from "./helpers/createVideoMediaAsset"
import { getVideoDescriptors } from "./helpers/getVideoDescriptors"
import { getVideoThumbnailDescriptor } from "./helpers/getVideoThumbnailDescriptors"
import { VideoJob } from "./types"

export default async function process(job: VideoJob) {
  const { key, pathToVideo, mediaId } = job.data

  const finished = job.data.finished ?? []

  const pathToThumbnail = await ensureThumbnail(job)

  // Create thumbnail assets
  for (const d of getVideoThumbnailDescriptor()) {
    const { name, transcode, mime, width, height } = d

    const locator = getLocator("S3", "images", key, name)
    const writeStream = getStorageWriteStream(locator, mime)

    await transcode({
      onProgress: () => {},
      pathToFile: pathToThumbnail,
      write: writeStream,
    })

    await createVideoMediaAsset({
      type: name,
      metadata: { width, height },
      mediaId,
      locator,
    })
  }

  // Filter out already finished descriptors
  const filteredDescriptors = getVideoDescriptors().filter(
    (d) => !finished.includes(d.name)
  )

  // Handle progress divided by how many transcoding jobs
  const handleProgress = (progress: number) => {
    job.progress(progress / filteredDescriptors.length)
  }

  // Map all transcoding jobs into a concurrent list of promises
  const transcodingProccesses = filteredDescriptors.map(async (d) => {
    const { name, transcode, mime } = d

    const locator = getLocator("S3", "videos", key, name)
    const writeStream = getStorageWriteStream(locator, mime)

    await transcode({
      onProgress: handleProgress,
      pathToFile: pathToVideo,
      write: writeStream,
    })

    await createVideoMediaAsset({
      type: name,
      metadata: {},
      mediaId,
      locator,
    })

    finished.push(name)
    await job.update({ ...job.data, finished })
  })

  await Promise.allSettled(transcodingProccesses)
}

const ensureThumbnail = async (job: VideoJob) => {
  const { pathToVideo, pathToThumbnail, metadata } = job.data

  if (pathToThumbnail) {
    return pathToThumbnail
  }

  const { duration } = metadata.probed.format
  const seek = Math.round(duration! * 0.25)

  const newPathToThumbnail = await createThumbnail(pathToVideo, seek)
  await job.update({ ...job.data, pathToThumbnail: newPathToThumbnail })

  return newPathToThumbnail
}
