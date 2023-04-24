import { transcodeToBroadcastable } from "../../transcoders/transcodeToBroadcastable.js"
import { transcodeToTheora } from "../../transcoders/transcodeToTheora.js"
import { transcodeToWebM } from "../../transcoders/transcodeToWebM.js"
import { transcodeToHLS } from "../../transcoders/transcodeToHLS"

export type VideoTranscoders = "broadcastable" | "theora" | "webm" | "hls"

export const VideoDescriptors = [
  {
    name: "broadcastable",
    transcode: transcodeToBroadcastable,
  },
  {
    name: "theora",
    transcode: transcodeToTheora,
  },
  {
    name: "webm",
    transcode: transcodeToWebM,
  },
  {
    name: "hls",
    transcode: transcodeToHLS,
  },
] as const
