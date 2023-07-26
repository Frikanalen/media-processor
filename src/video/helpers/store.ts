import type { TranscoderOutputFile } from "../transcode/types"
import { s3Client } from "../../s3Client"
import fs from "fs"
import { Bucket } from "../process"

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
