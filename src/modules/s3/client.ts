import { S3 } from "@aws-sdk/client-s3"
import { AWS_ENDPOINT } from "./constants"
const AWS = require("aws-sdk")

const credentials = new AWS.EnvironmentCredentials("AWS")

export const s3Client = new S3({
  endpoint: AWS_ENDPOINT,
  credentials,
})
