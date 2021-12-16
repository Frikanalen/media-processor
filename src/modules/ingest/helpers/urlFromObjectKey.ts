import { HttpRequest } from "@aws-sdk/protocol-http"
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner"
import { parseUrl } from "@aws-sdk/url-parser"
import { Hash } from "@aws-sdk/hash-node"
import { formatUrl } from "@aws-sdk/util-format-url"
import { AWS_ENDPOINT } from "../../s3/constants"
var AWS = require("aws-sdk")

export const urlFromObjectKey = async (objectKey: string) => {
  const bucket = "incoming"
  const region = "no-where-1"
  const credentials = new AWS.EnvironmentCredentials("AWS")
  const s3ObjectUrl = parseUrl(`${AWS_ENDPOINT}/${bucket}/${objectKey}`)
  const presigner = new S3RequestPresigner({
    credentials,
    region,
    sha256: Hash.bind(null, "sha256"),
  })

  const url = await presigner.presign(new HttpRequest(s3ObjectUrl))

  return formatUrl(url)
}
