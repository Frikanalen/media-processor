import { unlink } from "fs/promises"
import { log } from "../../log"

/**
 * Delete files.
 * @param {string[]} paths - Array of file paths to clean up.
 */
export const cleanupFiles = async (paths: string[]): Promise<void> => {
  for (const path of paths) {
    if (!path) {
      log.info(`cleanupFiles: path [${path}] is invalid, skipping`)
      continue
    }
    try {
      await unlink(path)
    } catch (e) {
      log.error(`cleanupFiles: failed to delete file ${path}`, e)
    }
  }
}
