export type ResumableUploadData = {
  /** The key used to identify the upload */
  key: string
  /** The path to the file */
  path: string
  /** Upload offset, how many bytes has been uploaded */
  offset: number
  /** Total amount of bytes, the size of the file */
  length: number
  /** The name of the file uploaded */
  filename: string
  /** What kind of media */
  type: string
  /** The user that creted this upload */
  user: number
  /** Metadata used for various reasons */
  metadata: Record<string, string>
}
