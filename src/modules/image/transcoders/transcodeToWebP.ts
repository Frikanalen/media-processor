import { Transcoder } from "../../transcoding/types"
import sharp from "sharp"
import { pipeline } from "stream/promises"

export const transcodeToWebP =
  (width: number, height: number): Transcoder =>
  async (options) => {
    const { pathToFile, write } = options

    const transform = sharp(pathToFile)
      .resize({ width, height, fit: sharp.fit.contain })
      .webp()

    await pipeline(transform, write)
  }
