export const IS_PROD = process.env["NODE_ENV"] === "production"
export const TEMP_UPLOAD_FOLDER = "tmp-upload"
export const SECRET_KEY_HEADER = "X-Api-Key"
export const FK_API_KEY = process.env["FK_API_KEY"]!
export const FK_API = process.env["FK_API"]!

if (!FK_API) {
  throw new Error(
    "FK_API is not set! Please set it to the base url of the api to communicate with.",
  )
}

if (!FK_API_KEY) {
  throw new Error(
    "FK_API_KEY is not set, this means internal endpoints will be unreachable",
  )
}

export const MEDIA_BUCKET = "media"
const getRedisURL = () => {
  const { REDIS_SERVICE_HOST, REDIS_SERVICE_PORT, REDIS_URL } = process.env

  if (REDIS_SERVICE_HOST?.length && REDIS_SERVICE_PORT?.length)
    return `redis://${REDIS_SERVICE_HOST}:${REDIS_SERVICE_PORT}`

  if (!REDIS_URL?.length) {
    throw new Error(
      "REDIS_SERVICE_HOST && REDIS_SERVICE_PORT or REDIS_URL is not set!",
    )
  }

  return REDIS_URL
}
export const REDIS_URL = getRedisURL()
