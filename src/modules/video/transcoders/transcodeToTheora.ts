import ffmpeg from "fluent-ffmpeg"
import type { Transcoder } from "../../transcoding/types.js"

export const transcodeToTheora: Transcoder = async (options) => {
  const { pathToFile, write, onProgress } = options

  return new Promise((resolve, reject) => {
    const theora = ffmpeg()
      .input(pathToFile)
      .output(write)
      .format("ogg")
      .outputOptions(["-qscale:v 7", "-qscale:a 2"])
      .aspect("16:9")
      .size("720x?")
      .autopad(true)

    theora.on("progress", (progress) => onProgress(progress.percent))
    theora.on("end", () => resolve())
    theora.on("error", (e) => reject(e))
    theora.run()
  })
}
