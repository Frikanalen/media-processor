import type { Job } from "bull"
import type { VideoTranscoders } from "./helpers/getVideoDescriptors"
import type { VideoMetadataV2 } from "./helpers/getVideoMetadata"

export type VideoJobData = {
  key: string
  pathToVideo: string
  pathToStill?: string
  metadata: VideoMetadataV2
  mediaId: number
  finished?: VideoTranscoders[]
  error?: string
}

export type VideoJob = Job<VideoJobData>
