import { MediaService } from "../../generated"
import { FK_API_KEY } from "../../config"
import { getLocator } from "../getLocator"
import { Bucket } from "../process"

export async function register(
  uploadId: string,
  outputFormat: "broadcastable" | "theora" | "webm" | "hls",
  mediaId: number,
) {
  await MediaService.postVideosMediaAssets(mediaId, FK_API_KEY, {
    type: outputFormat,
    metadata: {},
    locator: getLocator("S3", Bucket, uploadId, outputFormat),
  })
}
