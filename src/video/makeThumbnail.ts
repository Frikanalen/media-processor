import type { VideoJob } from "./types.js"
import fs from "fs"
import { log } from "../log.js"
import { toWebP } from "./transcode/toWebP.js"
import { s3Client } from "../s3Client.js"
import { MediaService } from "../generated/index.js"
import { FK_API_KEY } from "../config.js"
import { getLocator } from "./helpers/getLocator.js"
import { Bucket } from "./process.js"
import { tempDir } from "./helpers/tempDir.js"

export const makeThumbnail = async (
  job: VideoJob,
  thumbType: string,
  dimensions: { width: number; height: number },
) => {
  const { width, height } = dimensions
  const { uploadId, pathToStill, mediaId } = job.data

  if (!pathToStill) throw new Error("No input still found")

  const outputDir = tempDir(uploadId, thumbType)

  log.info(`Generating thumbnail ${thumbType} for ${mediaId}`)

  const result = await toWebP({
    onProgress: (progress) => {
      log.debug(`${progress}%`)
    },
    inputPath: pathToStill!,
    outputDir,
    width,
    height,
  })

  await s3Client.putObject({
    Bucket,
    Key: `${uploadId}/${thumbType}`,
    Body: await fs.createReadStream(result.asset.path),
    ContentType: result.asset.mime,
  })

  await fs.rmSync(outputDir, { recursive: true })

  await MediaService.postVideosMediaAssets(mediaId, FK_API_KEY, {
    type: thumbType,
    metadata: dimensions,
    locator: getLocator("S3", Bucket, uploadId, thumbType),
  })
}
