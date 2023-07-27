import type { VideoMetadataV2 } from "../../video/getVideoMetadata.js"
import { log } from "../../log.js"
import { MediaService } from "../../generated/index.js"
import { FK_API_KEY } from "../../config.js"

export async function registerMedia(
  originalLocator: `S3:${string}` | `CLOUDFLARE:${string}`,
  filename: string,
  metadata: VideoMetadataV2,
) {
  log.info("Registering file on backend")

  const { id } = await MediaService.postVideosMedia(FK_API_KEY, {
    locator: originalLocator,
    fileName: filename,
    duration: metadata.duration,
    metadata,
  })

  return id
}
