import ffmpeg from "fluent-ffmpeg"
import type { Transcoder } from "./types.js"

export const toBroadcast: Transcoder = async (options) => {
  const { inputPath, outputDir, onProgress } = options
  const outputPath = `${outputDir}/broadcast.mxf`

  return new Promise((resolve, reject) => {
    const broadcast = ffmpeg()
      .input(inputPath)
      .output(outputPath)
      .format("mxf")
      .videoCodec("libx264")
      .outputOption("-crf 18")
      .outputOptions("-ar 48000")
      .outputOptions("-ac 2")
      .audioCodec("pcm_s16le")
      .aspect("16:9")
      .keepDAR()
      .size("1280x720")
      .autopad(true)

    broadcast.on("progress", ({ percent }) => {
      onProgress(percent ?? 0)
    })
    broadcast.on("end", () =>
      resolve({ asset: { path: outputPath, mime: "application/mxf" } }),
    )
    broadcast.on("error", (e) => reject(e))
    broadcast.run()
  })
}
