import { toBroadcast } from "./transcode/toBroadcast.js"
import { toTheora } from "./transcode/toTheora.js"
import { toWebM } from "./transcode/toWebM.js"
// import { toHLS } from '../../transcode/toHLS.js'

export type VideoTranscoder = "broadcastable" | "theora" | "webm" | "hls"

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
  /* Disabled for now
  {
    name: "hls",
    transcode: toHLS,
  },
  */
] as const
