import type { TranscoderDescriptor } from "../../transcoding/types.js"
import { transcodeToBroadcastable } from "../../transcoders/transcodeToBroadcastable.js"
import { transcodeToTheora } from "../../transcoders/transcodeToTheora.js"
import { transcodeToWebM } from "../../transcoders/transcodeToWebM.js"
import { transcodeToHLS } from "../../transcoders/transcodeToHLS"

type TheoraDescriptor = TranscoderDescriptor<"theora", typeof transcodeToTheora>
type BroadcastableDescriptor = TranscoderDescriptor<
  "broadcastable",
  typeof transcodeToBroadcastable
>

type WebMDescriptor = TranscoderDescriptor<"webm", typeof transcodeToWebM>

type HLSDescriptor = TranscoderDescriptor<"hls", typeof transcodeToHLS>

export type VideoDescriptor =
  | TheoraDescriptor
  | BroadcastableDescriptor
  | WebMDescriptor
  | HLSDescriptor

export const getVideoDescriptors = (): VideoDescriptor[] => {
  return [
    {
      name: "broadcastable",
      mime: "application/mxf",
      transcode: transcodeToBroadcastable,
    },
    {
      name: "theora",
      mime: "video/ogg",
      transcode: transcodeToTheora,
    },
    {
      name: "webm",
      mime: "video/webm",
      transcode: transcodeToWebM,
    },
    {
      name: "hls",
      mime: "application/vnd.apple.mpegurl",
      transcode: transcodeToHLS,
    },
  ]
}

export type VideoDescriptorName = VideoDescriptor["name"]
