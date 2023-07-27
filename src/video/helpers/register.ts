import { MediaService } from "../../generated/index.js"
import { FK_API_KEY } from "../../config.js"
import { getLocator } from "./getLocator.js"
import { Bucket } from "../process.js"
import type { VideoTranscoder } from "../getVideoDescriptors.js"

export const register = async (
  uploadId: string,
  outputFormat: VideoTranscoder,
  mediaId: number,
) =>
  MediaService.postVideosMediaAssets(mediaId, FK_API_KEY, {
    type: outputFormat,
    metadata: {},
    locator: getLocator("S3", Bucket, uploadId, outputFormat),
  })
