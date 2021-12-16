import { execSync } from "child_process"
import { FfprobeData } from "fluent-ffmpeg"
import { probe } from "../../core/helpers/probe"

export type VideoMetadata = {
  version: "1"
  mime: string
  probed: FfprobeData
}

export const getVideoMetadata = async (
  path: string
): Promise<VideoMetadata> => {
  const probed = await probe(path)
  const mime = execSync(`file -b --mime-type ${path}`).toString()

  if (probed.streams.length < 1) {
    throw new Error("No available streams!")
  }

  return {
    mime,
    probed,
    version: "1",
  }
}
