import type { Middleware } from "koa"
import type { UploadHookState } from "../types"
import { s3Client } from "../../s3Client"
import { MEDIA_BUCKET } from "../../config"
import fs from "fs"

export const store: Middleware<UploadHookState> = async (ctx, next) => {
  const { uploadId, Path, metadata } = ctx.state

  await s3Client.putObject({
    Bucket: MEDIA_BUCKET,
    Key: `${uploadId}`,
    Body: await fs.createReadStream(Path),
    ContentType: metadata.mime,
  })

  return next()
}
