import type { Middleware } from "koa"
import type { UploadHookState } from "../types"
import { getVideoMetadata } from "../../video/getVideoMetadata"
import { log } from "../../log"

// Analyze the received file to extract metadata
export const analyze: Middleware<UploadHookState> = async (ctx, next) => {
  const { Path, uploadId } = ctx.state
  log.info(`Analyzing ${Path} for metadata`, { uploadId })

  try {
    ctx.state.metadata = await getVideoMetadata(Path)
    return next()
  } catch (error: any) {
    log.error(`Failed to analyze ${Path}: ${error}`, { uploadId })
    return ctx.throw(400, "Invalid file")
  }
}
