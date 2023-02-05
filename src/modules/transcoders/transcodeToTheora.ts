import ffmpeg from "fluent-ffmpeg"
import type { Transcoder } from "../transcoding/types"

export const transcodeToTheora: Transcoder = async (options) => {
  const { inputPath, outputPath, onProgress } = options

  return new Promise((resolve, reject) => {
    const theora = ffmpeg()
      .input(inputPath)
      .output(outputPath)
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
