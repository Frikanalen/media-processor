import ffmpeg from "fluent-ffmpeg"
import { basename } from "path"
import { log } from "../log.js"

/** Creates a png still of the specified seek position */
export const grabStill = (path: string, seek: number) => {
  const name = basename(path)
  const outputPath = path.replace(name, `${name}-still.png`)

  log.info(`Generating thumbnail for ${path} @ ${seek}s -> ${outputPath}`)

  return new Promise<string>((resolve, reject) => {
    ffmpeg({ logger: log })
      .input(path)
      .seek(seek)
      .frames(1)
      .on("end", () => resolve(outputPath))
      .on("error", (e) => reject(e))
      .save(outputPath)
  })
}
