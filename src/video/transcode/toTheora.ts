import ffmpeg from "fluent-ffmpeg"
import type { Transcoder } from "./types.js"

export const toTheora: Transcoder = async (options) => {
  const { inputPath, outputDir, onProgress } = options
  const outputPath = `${outputDir}/theora.ogv`

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
    theora.on("end", () =>
      resolve({ asset: { path: outputPath, mime: "video/ogg" } }),
    )
    theora.on("error", (e) => reject(e))
    theora.run()
  })
}
