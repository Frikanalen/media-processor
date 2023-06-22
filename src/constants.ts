export const IS_PROD = process.env["NODE_ENV"] === "production"
export const TEMP_UPLOAD_FOLDER = "tmp-upload"
export const SECRET_KEY_HEADER = "X-Api-Key"
export const FK_API_KEY = process.env["FK_API_KEY"]!
export const FK_API = process.env["FK_API"]!

if (!FK_API) {
  throw new Error(
    "FK_API is not set! Please set it to the base url of the api to communicate with."
  )
}

if (!FK_API_KEY) {
  throw new Error(
    "FK_API_KEY is not set, this means internal endpoints will be unreachable"
  )
}
