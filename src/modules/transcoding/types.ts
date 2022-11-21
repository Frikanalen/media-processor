import type { Writable } from "stream"

export type TranscoderOptions = {
  pathToFile: string
  write: Writable
  onProgress: (value: number) => void
}

export type Transcoder = (options: TranscoderOptions) => Promise<void>

export type BaseTranscoderDescriptor<N extends string, T extends Transcoder> = {
  name: N
  mime: string
  transcode: T
}

export type TranscoderDescriptor<
  N extends string = "",
  T extends Transcoder = Transcoder
> = BaseTranscoderDescriptor<N, T>
