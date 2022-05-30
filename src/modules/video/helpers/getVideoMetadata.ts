import { execSync } from "child_process"
import { FfprobeData } from "fluent-ffmpeg"
import { probeVideo } from "../../core/helpers/probeVideo"
import { log } from "../../core/log"

export type VideoMetadata = {
  version: "1"
  mime: string
  probed: FfprobeData
}

export const getVideoMetadata = async (
  path: string
): Promise<VideoMetadata> => {
  log.info(`Running ffprobe on "${path}"`)

  const probed = await probeVideo(path)
  const mime = execSync(`file -b --mime-type ${path}`).toString().trim()

  if (probed.streams.length < 1) {
    throw new Error("No available streams!")
  }

  return {
    mime,
    probed,
    version: "1",
  }
}
