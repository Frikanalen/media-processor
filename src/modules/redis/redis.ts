import { createClient } from "redis"

export const REDIS_URL = process.env.REDIS_URL!

if (!REDIS_URL) {
  throw new Error("REDIS_URL is not set!")
}

export const redis = createClient({
  url: REDIS_URL,
})
