import { execSync } from "child_process"
import type { FfprobeData, FfprobeStream } from "fluent-ffmpeg"
import { probeVideo } from "../middleware/probeVideo.js"
import { log } from "../../log.js"

export type VideoStats = {
  codec: string
  width: number
  height: number
  resolution: string
  frameRate: number
  sar: string
  aspect: string
  quality: string
  averageBitrate: number
}

export type AudioStats = {
  codec: string
  channels: number
  quality: string
  averageBitrate: number
}

export type VideoMetadataV2 = {
  version: "2"
  mime: string
  duration: number
  video: VideoStats
  audio: AudioStats
  probed: FfprobeData
}

export type VideoMetadata = {
  version: "1"
  mime: string
  probed: FfprobeData
}

const getVideoQuality = (
  width: number,
  height: number,
  isInterlaced: boolean
): string => {
  const progressiveSuffix = isInterlaced ? "i" : "p"

  if (width <= 720 && height === 480) {
    return "480" + progressiveSuffix
  } else if (width <= 720 && height === 576) {
    return "576" + progressiveSuffix
  } else if (width === 1280 && height === 720) {
    return "720" + progressiveSuffix
  } else if (width === 1920 && height === 1080) {
    return "1080" + progressiveSuffix
  } else if (width === 2048 && height === 1080) {
    return "2K" + progressiveSuffix
  } else if (width === 3840 && height === 2160) {
    return "UHD-1" + progressiveSuffix // UHD-1, also known as 4K UHD or 2160p
  } else if (width === 4096 && height === 2160) {
    return "4K" + progressiveSuffix // Cinematic 4K
  } else if (width === 7680 && height === 4320) {
    return "UHD-2" + progressiveSuffix // UHD-2, also known as 8K UHD or 4320p
  } else {
    return "Unknown"
  }
}
const getVideoStats = (streams: FfprobeStream[]): VideoStats => {
  const videoStream = streams.find((stream) => stream.codec_type === "video")

  if (
    !videoStream ||
    !videoStream.codec_name ||
    videoStream.codec_name.length === 0
  ) {
    throw new Error("No video stream found or codec_name is not available!")
  }

  if (
    videoStream.width === undefined ||
    videoStream.height === undefined ||
    videoStream.avg_frame_rate === undefined ||
    videoStream.bit_rate === undefined ||
    !videoStream.sample_aspect_ratio ||
    !videoStream.display_aspect_ratio
  ) {
    throw new Error("Required video stream properties are not available.")
  }

  const isInterlaced = videoStream.field_order !== "progressive"
  const videoQuality = getVideoQuality(
    videoStream.width,
    videoStream.height,
    isInterlaced
  )

  return {
    codec: videoStream.codec_name,
    width: videoStream.width,
    height: videoStream.height,
    resolution: `${videoStream.width}x${videoStream.height}`,
    frameRate: parseFloat(videoStream.avg_frame_rate),
    sar: videoStream.sample_aspect_ratio,
    aspect: videoStream.display_aspect_ratio,
    quality: videoQuality,
    averageBitrate: parseInt(videoStream.bit_rate, 10) / 1000,
  }
}

const getAudioStats = (streams: FfprobeStream[]): AudioStats => {
  const audioStream = streams.find((stream) => stream.codec_type === "audio")

  if (
    !audioStream ||
    !audioStream.codec_name ||
    audioStream.codec_name.length === 0
  ) {
    throw new Error("No audio stream found or codec_name is not available!")
  }

  if (
    audioStream.channels === undefined ||
    audioStream.bit_rate === undefined
  ) {
    throw new Error("Required audio stream properties are not available.")
  }

  const audioQuality = getAudioQuality(audioStream.channels)

  return {
    codec: audioStream.codec_name,
    channels: audioStream.channels,
    quality: audioQuality,
    averageBitrate: parseInt(audioStream.bit_rate, 10) / 1000,
  }
}

const getAudioQuality = (channels: number): string => {
  if (channels === 1) {
    return "mono"
  } else if (channels === 2) {
    return "stereo"
  } else {
    return "surround"
  }
}

export const getVideoMetadata = async (
  path: string
): Promise<VideoMetadataV2> => {
  log.info(`Running ffprobe on "${path}"`)

  const probed = await probeVideo(path)
  const mime = execSync(`file -b --mime-type ${path}`).toString().trim()

  if (probed.streams.length < 1) {
    throw new Error("No available streams!")
  }

  // Despite the typings, "duration" comes back as "N/A" if it's an image
  if (!probed.format.duration || `${probed.format.duration}` === "N/A")
    throw new Error(`File duration is ${probed.format.duration}`)

  const videoStats = getVideoStats(probed.streams)
  const audioStats = getAudioStats(probed.streams)
  const duration = parseInt(`${probed.format.duration}`)

  return {
    mime,
    duration,
    video: videoStats,
    audio: audioStats,
    version: "2",
    probed: probed,
  }
}
