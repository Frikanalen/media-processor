import { MediaService } from "../../generated"
import { FK_API_KEY } from "../../config"
import { getLocator } from "./getLocator"
import { Bucket } from "../process"
import type { VideoTranscoder } from "../getVideoDescriptors"

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
