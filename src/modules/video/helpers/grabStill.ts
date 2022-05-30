import ffmpeg from "fluent-ffmpeg"
import { basename } from "path"
import { log } from "../../core/log"

/** Creates a png still of the specified seek position */
export const grabStill = (path: string, seek: number) => {
  const name = basename(path)
  const outputPath = path.replace(name, `${name}-still.png`)

  log.info(`Generating thumbnail for ${path} @ ${seek}s`)

  return new Promise<string>((resolve, reject) => {
    ffmpeg()
      .input(path)
      .output(outputPath)
      .frames(1)
      .seek(seek)
      .on("end", () => resolve(outputPath))
      .on("error", (e) => reject(e))
      .run()
  })
}
