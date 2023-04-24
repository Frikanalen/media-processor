export type TranscoderOptions = {
  inputPath: string // Input file spec
  outputDir: string // Base temporary directory
  onProgress: (value: number) => void
}

export type TranscoderOutputFile = {
  path: string
  mime: string
}

export type TranscoderResult = {
  asset: TranscoderOutputFile
  subfiles?: TranscoderOutputFile[]
}

export type Transcoder<ExtraOptions = {}, ExtraResults = {}> = (
  options: TranscoderOptions & ExtraOptions
) => Promise<TranscoderResult & ExtraResults>
