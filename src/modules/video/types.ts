import { Job } from "bull"
import { VideoDescriptorName } from "./helpers/getVideoDescriptors"
import { VideoMetadata } from "./helpers/getVideoMetadata"

export type VideoJobData = {
  key: string
  pathToVideo: string
  pathToThumbnail?: string
  metadata: VideoMetadata
  mediaId: number
  finished?: VideoDescriptorName[]
}

export type VideoJob = Job<VideoJobData>
