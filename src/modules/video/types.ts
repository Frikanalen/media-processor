import type { Job } from "bull"
import type { VideoDescriptorName } from "./helpers/getVideoDescriptors"
import type { VideoMetadata } from "./helpers/getVideoMetadata"

export type VideoJobData = {
  key: string
  pathToVideo: string
  pathToStill?: string
  metadata: VideoMetadata
  mediaId: number
  finished?: VideoDescriptorName[]
}

export type VideoJob = Job<VideoJobData>
