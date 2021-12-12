export const SECRET_KEY_HEADER = "X-Api-Key"
export const SECRET_KEY = process.env.FK_API_KEY

if (!SECRET_KEY) {
  console.warn(
    "Warning: FK_API_KEY is not set, this means internal endpoints will be unreachable",
  )
}
