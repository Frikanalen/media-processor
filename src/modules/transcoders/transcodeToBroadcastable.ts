import ffmpeg from "fluent-ffmpeg"
import type { Transcoder } from "../../transcoding/types.js"

export const transcodeToBroadcastable: Transcoder = async (options) => {
  const { pathToFile, write, onProgress } = options

  return new Promise((resolve, reject) => {
    const broadcast = ffmpeg()
      .input(pathToFile)
      .output(write)
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

    broadcast.on("progress", (progress) => onProgress(progress.percent))
    broadcast.on("end", () => resolve())
    broadcast.on("error", (e) => reject(e))
    broadcast.run()
  })
}
