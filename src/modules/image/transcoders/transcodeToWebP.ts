import type { Transcoder } from "../../transcoding/types.js"
import sharp from "sharp"
import type { ThumbnailSettings } from "../../video/helpers/thumbnailDescriptors"

export const transcodeToWebP: Transcoder<ThumbnailSettings> = async (
  options
) => {
  const { inputPath, outputDir, onProgress, width, height } = options

  const path = `${outputDir}/${width}x${height}.webp`

  await sharp(inputPath)
    .resize({ width, height, fit: sharp.fit.contain })
    .webp()
    .toFile(path)

  onProgress(100)

  return { asset: { path, mime: "image/webp" } }
}
