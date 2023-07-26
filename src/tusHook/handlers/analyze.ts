import type { Middleware } from "koa"
import type { UploadHookState } from "../types"
import { getVideoMetadata } from "../../video/getVideoMetadata"
import { log } from "../../log"
import { stat } from "fs"
import { promisify } from "util"
const statAsync = promisify(stat)

// Analyze the received file to extract metadata
export const analyze: Middleware<UploadHookState> = async (ctx, next) => {
  const { Path, uploadId } = ctx.state
  log.info(`Analyzing ${Path} for metadata`, { uploadId })
  const stats = await statAsync(Path)
  if (!stats.isFile()) {
    log.error(`Rejecting ${Path}`, { uploadId })
    return ctx.throw(400, "Invalid file")
  }
  const metadata = await getVideoMetadata(Path)
  if (!metadata) {
    log.error(`Rejecting ${Path}`, { uploadId })
    return ctx.throw(400, "Invalid file")
  }
  ctx.state.metadata = metadata
  return next()
}
