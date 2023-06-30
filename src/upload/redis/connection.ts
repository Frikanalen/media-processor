import { createClient } from "redis"

const getRedisURL = () => {
  const { REDIS_SERVICE_HOST, REDIS_SERVICE_PORT, REDIS_URL } = process.env

  if (REDIS_SERVICE_HOST?.length && REDIS_SERVICE_PORT?.length)
    return `redis://${REDIS_SERVICE_HOST}:${REDIS_SERVICE_PORT}`

  if (!REDIS_URL?.length) {
    throw new Error("REDIS_SERVICE_HOST && REDIS_SERVICE_PORT or REDIS_URL is not set!")
  }

  return REDIS_URL
}

export const url = getRedisURL()

export const connection = createClient({
  url,
})
