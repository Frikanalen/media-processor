import type { Transcoder } from "../../transcoding/types.js"
import sharp from "sharp"
import { pipeline } from "stream/promises"

export const transcodeToWebP =
  (width: number, height: number): Transcoder =>
  async (options) => {
    const { pathToFile, write, onProgress } = options

    const transform = sharp(pathToFile)
      .resize({ width, height, fit: sharp.fit.contain })
      .webp()

    await pipeline(transform, write)

    onProgress(100)
  }
