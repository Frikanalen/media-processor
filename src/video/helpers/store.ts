import type { TranscoderOutputFile } from "../transcode/types.js"
import { s3Client } from "../../s3Client.js"
import fs from "fs"
import { Bucket } from "../process.js"

export async function store(
  uploadId: string,
  format: string,
  { path, mime }: TranscoderOutputFile,
) {
  await s3Client.putObject({
    Bucket,
    Key: `${uploadId}/${format}`,
    Body: await fs.createReadStream(path),
    ContentType: mime,
  })
}
