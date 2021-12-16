import { transcodeToWebP } from "../../image/transcoders/transcodeToWebP"
import { TranscoderDescriptor } from "../../transcoding/types"

type WebPDescriptor<N extends string> = TranscoderDescriptor<
  N,
  ReturnType<typeof transcodeToWebP>
>

export type ThumbnailDescriptor<N extends string> = WebPDescriptor<N> & {
  width: number
  height: number
}

const dimensions = {
  large: [1280, 720],
  medium: [852, 480],
  small: [360, 640],
}

export const getVideoThumbnailDescriptor = (): ThumbnailDescriptor<any>[] => {
  return Object.entries(dimensions).map(([key, dimensions]) => {
    const [width, height] = dimensions

    return {
      name: `thumbnail-${key}`,
      mime: "image/webp",
      width,
      height,
      transcode: transcodeToWebP(width, height),
    }
  })
}
