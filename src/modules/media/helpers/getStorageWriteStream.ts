import { PassThrough } from "stream"
import { s3Client } from "../../core/client"

import type { LocatorString, Provider, S3LocatorString } from "./getLocator"

type S3Locator = {
  provider: "S3"
  bucket: string
  key: string
}

export const parseLocator = (locator: LocatorString): S3Locator => {
  const [provider, s3] = locator.split(":") as [Provider, S3LocatorString]
  if (provider === "S3") {
    const [bucket, key] = s3.split(":") as [string, string]
    return { provider, bucket, key }
  } else {
    throw new Error(`Provider ${provider} not supported!`)
  }
}

export const getStorageWriteStream = (
  locator: LocatorString,
  contentType: string
) => {
  const { bucket, key } = parseLocator(locator)
  const stream = new PassThrough()

  s3Client.putObject({
    Bucket: bucket,
    Key: key,
    Body: stream,
    ContentType: contentType,
  })

  return stream
}
