import { S3 } from "@aws-sdk/client-s3"
import { AWS_ENDPOINT, AWS_REGION } from "./constants"
import AWS from "aws-sdk"

const credentials = new AWS.EnvironmentCredentials("AWS")

export const s3Client = new S3({
  endpoint: AWS_ENDPOINT,
  region: AWS_REGION,
  forcePathStyle: true,
  credentials,
})
