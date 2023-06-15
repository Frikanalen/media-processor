import ffmpeg from "fluent-ffmpeg"
import type { Transcoder } from "./types"

export const toWebM: Transcoder = async (options) => {
  const { inputPath, outputDir, onProgress } = options
  const outputPath = `${outputDir}/webm.webm`

  return new Promise((resolve, reject) => {
    const webm = ffmpeg({ logger: console })
      .input(inputPath)
      // Matroska format tweaks to put index at the start of file
      .outputOptions("-reserve_index_space 200k")
      .output(outputPath)
      .format("webm")
      .videoCodec("libvpx")
      .addOutputOption("-cpu-used -5")
      .addOutputOption("-deadline realtime")
      .aspect("16:9")
      .keepDAR()
      .size("1920x1080")

      .autopad(true)

    webm.on("progress", (progress) => onProgress(progress.percent))
    webm.on("end", () =>
      resolve({ asset: { path: outputPath, mime: "video/webm" } })
    )
    webm.on("error", (e) => reject(e))

    webm.run()
  })
}
