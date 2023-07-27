import type { VideoMetadataV2 } from "../video/getVideoMetadata.js"
import type { AuthState } from "../middleware/authenticate.js"

export type UploadHookState = {
  // Local path to received upload
  Path: string
  // Upload ID from tus
  uploadId: string
  // Original filename from tus
  originalFilename: string
  // File metadata
  metadata: VideoMetadataV2
  // Media locator (as used in the back-end database)
  locator: `S3:${string}`
  // All request cookies
  cookie: string
  mediaId: number
} & AuthState
