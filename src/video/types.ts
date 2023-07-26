import type { Job } from "bullmq"
import type { VideoTranscoder } from "./getVideoDescriptors.js"
import type { VideoMetadataV2 } from "./getVideoMetadata.js"

export type VideoJobData = {
  uploadId: string
  pathToVideo: string
  pathToStill?: string
  metadata: VideoMetadataV2
  mediaId: number
  finished?: VideoTranscoder[]
  error?: string
}

export type VideoJob = Job<VideoJobData>
