import { unlink } from "fs/promises"

/**
 * Delete files.
 * @param {string[]} paths - Array of file paths to clean up.
 */
export const cleanupFiles = async (paths: string[]): Promise<void> => {
  for (const path of paths) await unlink(path)
}
