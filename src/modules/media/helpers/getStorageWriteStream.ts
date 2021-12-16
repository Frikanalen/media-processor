import { PassThrough } from "stream"
import { s3Client } from "../../s3/client"
import { Locator, Provider } from "../types"

export const getStorageWriteStream = (
  locator: Locator,
  contentType: string
) => {
  const [provider, rest] = locator.split(":") as [Provider, string]

  if (provider === "S3") {
    const [bucket, key] = rest.split(":")

    const stream = new PassThrough()

    s3Client.putObject({
      Bucket: bucket,
      Key: key,
      Body: stream,
      ContentType: contentType,
    })

    return stream
  }

  throw new Error(`Provider ${provider} not supported!`)
}
