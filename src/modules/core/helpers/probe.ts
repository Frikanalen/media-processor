import { ffprobe, FfprobeData } from "fluent-ffmpeg"

export const probe = (path: string): Promise<FfprobeData> => {
  return new Promise((resolve, reject) => {
    ffprobe(path, (err, meta) => {
      if (err) return reject(err)
      resolve(meta)
    })
  })
}
