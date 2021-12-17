import ffmpeg from "fluent-ffmpeg"
import { Transcoder } from "../../transcoding/types"

export const transcodeToWebM: Transcoder = async (options) => {
  const { pathToFile, write, onProgress } = options

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(pathToFile)
      .output(write)
      .format("webm")
      .aspect("16:9")
      .keepDAR()
      .size("1920x1080")
      .autopad(true)
      .on("progress", (progress) => onProgress(progress.percent))
      .on("end", () => resolve())
      .on("error", (e) => reject(e))
      .run()
  })
}
