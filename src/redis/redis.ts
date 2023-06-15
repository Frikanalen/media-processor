import { createClient } from "redis"

export const url = `${process.env["REDIS_URL"]}`

if (!url.length) throw new Error("REDIS_URL is not set!")

export const redis = createClient({
  url,
})
