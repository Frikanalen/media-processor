export type TranscoderOptions = {
  inputPath: string // Input file spec
  outputDir: string // Base temporary directory
  onProgress: (value: number) => void
}

export type TranscoderResult = {
  asset: {
    // Primary media asset filespec - in case of segmented, it's the primary manifest
    // as delivered to the client
    path: string
  }
  streams?: { [k: string]: string[] }
}

export type Transcoder = (
  options: TranscoderOptions
) => Promise<TranscoderResult>

export type BaseTranscoderDescriptor<N extends string, T extends Transcoder> = {
  name: N
  mime: string
  transcode: T
}

export type TranscoderDescriptor<
  N extends string = "",
  T extends Transcoder = Transcoder
> = BaseTranscoderDescriptor<N, T>
