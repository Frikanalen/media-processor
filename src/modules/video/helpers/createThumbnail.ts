import ffmpeg from "fluent-ffmpeg"
import { basename } from "path"

/** Creates a png thumbnail of the specified seek position */
export const createThumbnail = (path: string, seek: number) => {
  const name = basename(path)
  const newPath = path.replace(name, `${name}-thumbnail.png`)

  return new Promise<string>((resolve, reject) => {
    ffmpeg()
      .input(path)
      .output(path)
      .frames(1)
      .seek(seek)
      .on("end", () => resolve(newPath))
      .on("error", (e) => reject(e))
      .run()
  })
}
