import pkg from "fluent-ffmpeg"
const { ffprobe } = pkg

import type { FfprobeData } from "fluent-ffmpeg"

export const probeVideo = (path: string): Promise<FfprobeData> => {
  return new Promise((resolve, reject) => {
    ffprobe(path, (err, meta) => {
      if (err) return reject(err)
      resolve(meta)
    })
  })
}
