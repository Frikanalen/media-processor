import type { TranscoderDescriptor } from "../../transcoding/types.js"
import { transcodeToBroadcastable } from "../transcoders/transcodeToBroadcastable.js"
import { transcodeToTheora } from "../transcoders/transcodeToTheora.js"
import { transcodeToWebM } from "../transcoders/transcodeToWebM.js"

type TheoraDescriptor = TranscoderDescriptor<"theora", typeof transcodeToTheora>
type BroadcastableDescriptor = TranscoderDescriptor<
  "broadcastable",
  typeof transcodeToBroadcastable
>

type WebMDescriptor = TranscoderDescriptor<"webm", typeof transcodeToWebM>

export type VideoDescriptor =
  | TheoraDescriptor
  | BroadcastableDescriptor
  | WebMDescriptor

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
  ]
}

export type VideoDescriptorName = VideoDescriptor["name"]
