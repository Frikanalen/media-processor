export const AWS_ENDPOINT = `http://${process.env.BUCKET_HOST}:${process.env.BUCKET_PORT}`
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
export const AWS_REGION = process.env.BUCKET_REGION

if (
  [AWS_ENDPOINT, AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID, AWS_REGION].some(
    (x) => !x
  )
) {
  throw new Error("Missing AWS environment variables!")
}
