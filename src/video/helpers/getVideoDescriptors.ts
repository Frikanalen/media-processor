import { toBroadcast } from "../../transcode/toBroadcast"
import { toTheora } from "../../transcode/toTheora"
import { toWebM } from "../../transcode/toWebM"
import { toHLS } from "../../transcode/toHLS"

export type VideoTranscoders = "broadcastable" | "theora" | "webm" | "hls"

export const VideoDescriptors = [
  {
    name: "broadcastable",
    transcode: toBroadcast,
  },
  {
    name: "theora",
    transcode: toTheora,
  },
  {
    name: "webm",
    transcode: toWebM,
  },
  {
    name: "hls",
    transcode: toHLS,
  },
] as const
