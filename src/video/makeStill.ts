import type { VideoJob } from "./types"
import assert from "assert"
import { log } from "../log.js"
import { basename } from "path"
import ffmpeg from "fluent-ffmpeg"

export const makeStill = async (job: VideoJob) => {
  const { pathToVideo, metadata } = job.data

  const duration = (metadata.probed.format.duration as unknown) ?? 0

  assert(typeof duration === "number", "Duration must be a number")

  if (!duration) log.error(`File upload ${pathToVideo} has no duration!`)

  const seek = Math.floor(duration * 0.3333)
  const name = basename(pathToVideo)
  const outputPath = pathToVideo.replace(name, `${name}-still.png`)

  log.info(
    `Generating thumbnail for ${pathToVideo} @ ${seek}s -> ${outputPath}`,
  )

  const pathToStill = await new Promise<string>((resolve, reject) => {
    ffmpeg({ logger: log })
      .input(pathToVideo)
      .seek(seek)
      .frames(1)
      .on("end", () => resolve(outputPath))
      .on("error", (e) => reject(e))
      .save(outputPath)
  })
  await job.updateData({
    ...job.data,
    pathToStill,
  })
}
