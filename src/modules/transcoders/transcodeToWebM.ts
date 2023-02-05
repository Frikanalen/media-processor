import ffmpeg from "fluent-ffmpeg"
import type { Transcoder } from "../transcoding/types"

export const transcodeToWebM: Transcoder = async (options) => {
  const { inputPath, outputPath, onProgress } = options

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
    webm.on("end", () => resolve())
    webm.on("error", (e) => reject(e))

    webm.run()
  })
}
