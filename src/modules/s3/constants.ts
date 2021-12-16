export const AWS_ENDPOINT = process.env.AWS_ENDPOINT
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
export const AWS_REGION = process.env.AWS_REGION

if (
  [AWS_ENDPOINT, AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID, AWS_REGION].some(
    (x) => !x
  )
) {
  throw new Error("Missing AWS environment variables!")
}
