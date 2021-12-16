import ffmpeg from "fluent-ffmpeg"
import { Transcoder } from "../../transcoding/types"

export const transcodeToTheora: Transcoder = async (options) => {
  const { read, write, onProgress } = options

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(read)
      .output(write)
      .format("ogg")
      .outputOptions(["-qscale:v 7", "-qscale:a 2"])
      .aspect("16:9")
      .size("720x?")
      .autopad(true)
      .on("progress", (progress) => onProgress(progress.percent))
      .on("end", () => resolve())
      .on("error", (e) => reject(e))
      .run()
  })
}
