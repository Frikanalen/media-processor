import type { VideoMetadataV2 } from "../../video/getVideoMetadata"
import { log } from "../../log"
import { MediaService } from "../../generated"
import { FK_API_KEY } from "../../config"

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
