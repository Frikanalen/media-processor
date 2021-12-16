import ffmpeg from "fluent-ffmpeg"
import { Transcoder } from "../../transcoding/types"

export const transcodeToBroadcastable: Transcoder = async (options) => {
  const { read, write, onProgress } = options

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(read)
      .output(write)
      .format("mov")
      .videoCodec("libx264")
      .outputOption("-crf 18")
      .audioCodec("pcm_s16le")
      .aspect("16:9")
      .keepDAR()
      .size("1280x720")
      .autopad(true)
      .on("progress", (progress) => onProgress(progress.percent))
      .on("end", () => resolve())
      .on("error", (e) => reject(e))
      .run()
  })
}