import { TranscoderDescriptor } from "../../transcoding/types"
import { transcodeToBroadcastable } from "../transcoders/transcodeToBroadcastable"
import { transcodeToTheora } from "../transcoders/transcodeToTheora"
import { transcodeToWebM } from "../transcoders/transcodeToWebM"

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
      mime: "video/quicktime",
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
