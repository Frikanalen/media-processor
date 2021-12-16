import { Transcoder } from "../../transcoding/types"
import sharp from "sharp"
import { pipeline } from "stream/promises"

export const transcodeToWebP =
  (width: number, height: number): Transcoder =>
  async (options) => {
    const { read, write } = options

    const chunks = []
    for await (const chunk of read) {
      chunks.push(chunk)
    }

    const transform = sharp(Buffer.concat(chunks))
      .resize({ width, height, fit: sharp.fit.contain })
      .webp()
      .pipe(write)

    await pipeline(read, transform, write)
  }
