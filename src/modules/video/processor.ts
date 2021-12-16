import { Job } from "bull"
import { FfprobeData } from "fluent-ffmpeg"
import { createReadStream } from "fs"
import { getLocator } from "../media/helpers/getLocator"
import { getStorageWriteStream } from "../media/helpers/getStorageWriteStream"
import { createThumbnail } from "./helpers/createThumbnail"
import { createVideoMediaAsset } from "./helpers/createVideoMediaAsset"
import { getVideoDescriptors } from "./helpers/getVideoDescriptors"
import { VideoJob } from "./types"

export default async function process(job: VideoJob) {
  const { key, pathToVideo, mediaId } = job.data

  const finished = job.data.finished ?? []

  const pathToThumbnail = await ensureThumbnail(job)
  throw new Error("Thumbnails not implemented!")

  const filteredDescriptors = getVideoDescriptors().filter(
    (d) => !finished.includes(d.name)
  )

  const handleProgress = (progress: number) => {
    job.progress(progress / filteredDescriptors.length)
  }

  const transcodingProccesses = filteredDescriptors.map(async (d) => {
    const { name, transcode, mime } = d

    const locator = getLocator("S3", key, name)
    const writeStream = getStorageWriteStream(locator, mime)
    const readStream = createReadStream(pathToVideo)

    await transcode({
      onProgress: handleProgress,
      read: readStream,
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

  await Promise.all(transcodingProccesses)
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
