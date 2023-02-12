import type { Transcoder } from "../../transcoding/types.js"
import sharp from "sharp"

export const transcodeToWebP =
  (width: number, height: number): Transcoder =>
  async (options) => {
    const { inputPath, outputDir, onProgress } = options

    const path = `${outputDir}/${width}x${height}.webp`

    await sharp(inputPath)
      .resize({ width, height, fit: sharp.fit.contain })
      .webp()
      .toFile(path)

    onProgress(100)

    return { asset: { path } }
  }
