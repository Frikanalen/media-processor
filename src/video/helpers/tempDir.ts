import fs from "fs"

/**
 * Generate a temporary directory.
 * @param {string} jobId - The ID of the job.
 * @param {string} assetName - The name of the asset.
 * @return {string} - The path to the temporary directory.
 */
export const tempDir = (jobId: string, assetName: string): string => {
  const tempDir = `tmp-upload/${jobId}_${assetName}`
  fs.mkdirSync(tempDir)
  return tempDir
}
