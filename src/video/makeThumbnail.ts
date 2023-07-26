import type { VideoJob } from "./types"
import fs from "fs"
import { log } from "../log"
import { toWebP } from "./transcode/toWebP"
import { s3Client } from "../s3Client"
import { MediaService } from "../generated"
import { FK_API_KEY } from "../config"
import { getLocator } from "./helpers/getLocator"
import { Bucket } from "./process"
import { tempDir } from "./helpers/tempDir"

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
