import type { Transcoder } from "../../transcoding/types.js"
import sharp from "sharp"

export const transcodeToWebP =
  (width: number, height: number): Transcoder =>
  async (options) => {
    const { inputPath, outputPath, onProgress } = options

    await sharp(inputPath)
      .resize({ width, height, fit: sharp.fit.contain })
      .webp()
      .toFile(outputPath)

    onProgress(100)
  }
