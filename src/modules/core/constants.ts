export const TEMP_UPLOAD_FOLDER = "tmp-upload"

export const API_BASE_URL = process.env.FK_API

if (!API_BASE_URL) {
  throw new Error(
    "FK_API is not set! Please set it to the base url of the api to communicate with."
  )
}

export const SECRET_KEY_HEADER = "X-Api-Key"
export const SECRET_KEY = process.env.FK_API_KEY

if (!SECRET_KEY) {
  console.warn(
    "Warning: FK_API_KEY is not set, this means internal endpoints will be unreachable"
  )
}
