import { open, close, createWriteStream, unlink, stat } from "fs"
import { promisify } from "util"
import { randomBytes } from "crypto"
import type { Readable } from "stream"
import { HttpError } from "../../core/HttpError"
import type { ResumableUploadData } from "../types/ResumableUploadData.js"
import { resumableUploadNamespace } from "../namespaces/resumableUploadNamespace.js"
import { TEMP_UPLOAD_FOLDER } from "../../core/constants.js"

const openAsync = promisify(open)
const closeAsync = promisify(close)
const unlinkAsync = promisify(unlink)
const statAsync = promisify(stat)

export type ResumableUploadCreateOptions = {
  user: number
  type: string
  length: number
  filename: string
  metadata: Record<string, string>
}

// Redis-backed resumable upload
export class ResumableUpload {
  constructor(private data: ResumableUploadData) {}

  public static async create(options: ResumableUploadCreateOptions) {
    const path = `${TEMP_UPLOAD_FOLDER}/${randomBytes(16).toString("hex")}`
    const key = `${randomBytes(16).toString("hex")}-${options.user}`

    const upload = new ResumableUpload({ ...options, offset: 0, path, key })

    await upload.createFile()
    return upload
  }

  public static async restore(key: string) {
    const data = await resumableUploadNamespace.get(key)
    if (!data) return undefined

    const upload = new ResumableUpload(data)

    try {
      const { size } = await statAsync(upload.path)
      upload.data.offset = size
    } catch (error: any) {
      if (error.code === "ENOENT") {
        throw new HttpError(410)
      }

      throw error
    }

    return upload
  }

  private async createFile() {
    const { path } = this.data
    const descriptor = await openAsync(path, "w")

    await this.save()
    await closeAsync(descriptor)
  }

  public writeToFile(readStream: Readable) {
    const { offset, path } = this.data

    const writeStream = createWriteStream(path, {
      flags: "r+",
      start: offset,
    })

    return new Promise((resolve, reject) => {
      writeStream.on("close", async () => {
        if (this.invalid) {
          reject(new HttpError(400, "Payload exceeds set length"))

          return
        }

        await this.save()
        resolve(undefined)
      })

      readStream.on("data", (buffer: Buffer) => {
        this.data.offset += buffer.length
      })

      readStream.on("error", () => {
        reject(new HttpError(500, "Stream error"))
      })

      readStream.pipe(writeStream)
    })
  }

  public async delete() {
    const { key, path } = this.data

    await unlinkAsync(path)
    await resumableUploadNamespace.delete(key)
  }

  public async save() {
    const { key } = this.data
    await resumableUploadNamespace.set(key, this.data)
  }

  public get finished() {
    const { offset, length } = this.data

    return offset === length
  }

  public get invalid() {
    const { offset, length } = this.data
    return offset > length
  }

  public get user() {
    return this.data.user
  }

  public get path() {
    return this.data.path
  }

  public get key() {
    return this.data.key
  }

  public get length() {
    return this.data.length
  }

  public get offset() {
    return this.data.offset
  }

  public get type() {
    return this.data.type
  }

  public get filename() {
    return this.data.filename
  }
}
